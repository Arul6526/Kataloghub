"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validators/category";
import { uploadFile, removeFile } from "@/lib/storage";
import type { Category } from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Ambil semua kategori dengan jumlah produk + status template. Dipakai di list page.
 */
export async function fetchCategories(opts?: { limit?: number; offset?: number; search?: string }) {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const limit = opts?.limit ?? 1000; // default: no pagination (backward compat)
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from("categories")
    .select(
      "id, name, slug, description, image_path, image_alt, is_visible, sort_order, created_at, updated_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (opts?.search) query = query.ilike("name", `%${opts.search}%`);

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);

  // Hitung produk per kategori
  const ids = (data as Category[]).map((c) => c.id);
  const counts: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("category_id")
      .eq("user_id", userId);
    if (prods) {
      for (const p of prods as { category_id: string }[]) {
        counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
      }
    }
  }

  // Cek template per kategori
  const templateMap: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: templates } = await supabase
      .from("category_spec_templates")
      .select("category_id, id");
    if (templates) {
      for (const t of templates as { category_id: string; id: string }[]) {
        templateMap[t.category_id] = (templateMap[t.category_id] ?? 0) + 1;
      }
    }
  }

  const items = (data as Category[]).map((c) => ({
    ...c,
    product_count: counts[c.id] ?? 0,
    has_template: (templateMap[c.id] ?? 0) > 0,
  }));

  return { items, total: count ?? 0 };
}

export async function fetchCategory(id: string) {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image_alt: formData.get("image_alt") || undefined,
    is_visible: formData.get("is_visible") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
    image_path: undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const input = parsed.data;

  // Cek slug unik
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", input.slug)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return { ok: false, error: "Slug sudah dipakai kategori lain" };

  // Handle upload gambar (opsional)
  let imagePath: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    try {
      const upload = await uploadFile("category-media", file, `cat-${input.slug}-${userId.slice(0, 8)}`);
      imagePath = upload.path;
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Gagal upload gambar kategori",
      };
    }
  }

  const { error } = await supabase.from("categories").insert({
    user_id: userId,
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    image_path: imagePath,
    image_alt: input.image_alt || null,
    is_visible: input.is_visible,
    sort_order: input.sort_order,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    image_alt: formData.get("image_alt") || undefined,
    is_visible: formData.get("is_visible") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
    image_path: undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const input = parsed.data;

  // Cek slug unik (kecuali diri sendiri)
  const { data: existing } = await supabase
    .from("categories")
    .select("id, image_path")
    .eq("slug", input.slug)
    .eq("user_id", userId)
    .neq("id", id)
    .maybeSingle();
  if (existing) return { ok: false, error: "Slug sudah dipakai kategori lain" };

  // Ambil kategori lama (untuk path gambar)
  const { data: oldRow } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  let imagePath = oldRow?.image_path ?? null;

  const file = formData.get("image") as File | null;
  const replaceImage = formData.get("replace_image") === "true";

  if (replaceImage && file && file.size > 0) {
    // Hapus gambar lama lalu upload baru
    if (imagePath) await removeFile("category-media", imagePath);
    try {
      const upload = await uploadFile("category-media", file, `cat-${input.slug}-${userId.slice(0, 8)}`);
      imagePath = upload.path;
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Gagal upload gambar kategori",
      };
    }
  } else if (replaceImage && (!file || file.size === 0)) {
    // Hapus gambar lama tanpa ganti
    if (imagePath) await removeFile("category-media", imagePath);
    imagePath = null;
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      image_path: imagePath,
      image_alt: input.image_alt || null,
      is_visible: input.is_visible,
      sort_order: input.sort_order,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Pastikan tidak ada produk yang memakai kategori ini
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("user_id", userId);
  if (count && count > 0) {
    return {
      ok: false,
      error: `Tidak bisa menghapus kategori yang masih memiliki ${count} produk. Pindahkan atau hapus produk terlebih dahulu.`,
    };
  }

  // Ambil image_path untuk dihapus dari storage
  const { data: cat } = await supabase
    .from("categories")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (cat?.image_path) await removeFile("category-media", cat.image_path);

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function toggleCategoryVisibleAction(
  id: string,
  is_visible: boolean,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_visible })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/categories");
  return { ok: true };
}