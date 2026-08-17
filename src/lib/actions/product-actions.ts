"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { uploadFile, removeFile } from "@/lib/storage";
import * as xlsx from "xlsx";
import type {
  CategorySpecField,
  Product,
  ProductDocument,
  ProductSpecValue,
  UUID,
} from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** List item ringkas untuk halaman list produk. */
export interface ProductListItem {
  id: UUID;
  name: string;
  slug: string;
  category_id: UUID;
  category_name: string;
  category_slug: string;
  main_image_path: string | null;
  price: number | null;
  is_visible: boolean;
  sort_order: number;
  updated_at: string;
  has_required_specs: boolean;
}

export interface FetchProductsResult {
  items: ProductListItem[];
  total: number;
}

/**
 * Ambil daftar produk dengan filter opsional (search nama, kategori, status).
 */
export async function fetchProducts(opts?: {
  search?: string;
  categoryId?: string;
  visible?: boolean;
  limit?: number;
  offset?: number;
}): Promise<FetchProductsResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  // Single query: products + categories left join
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, category_id, main_image_path, price, is_visible, sort_order, updated_at, categories(id, name, slug)",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (opts?.search) query = query.ilike("name", `%${opts.search}%`);
  if (opts?.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts?.visible !== undefined) query = query.eq("is_visible", opts.visible);

  const { data, count, error } = await query;
  if (error) {
    console.error("Supabase query error in fetchProducts:", error);
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as {
    id: UUID;
    name: string;
    slug: string;
    category_id: UUID;
    main_image_path: string | null;
    price: number | null;
    is_visible: boolean;
    sort_order: number;
    updated_at: string;
    categories: { id: UUID; name: string; slug: string } | null;
  }[];

  if (rows.length === 0) return { items: [], total: count ?? 0 };

  // ── BULK spec check: 3 queries total instead of N×3 N+1 queries ──
  const productIds = rows.map((r) => r.id);
  const categoryIds = Array.from(new Set(rows.map((r) => r.category_id).filter(Boolean)));

  // 1. Ambil semua template aktif untuk kategori-kategori yang relevan
  const { data: templates } = await supabase
    .from("category_spec_templates")
    .select("category_id, id")
    .in("category_id", categoryIds)
    .eq("is_active", true);

  const templateMap = new Map<UUID, UUID>();
  const templateIds: UUID[] = [];
  if (templates) {
    templates.forEach((t) => {
      templateMap.set(t.category_id as UUID, t.id as UUID);
      templateIds.push(t.id as UUID);
    });
  }

  // 2. Ambil semua field required untuk template-template tersebut
  const reqFieldsMap = new Map<UUID, UUID[]>();
  const allReqFieldIds: UUID[] = [];

  if (templateIds.length > 0) {
    const { data: fields } = await supabase
      .from("category_spec_fields")
      .select("id, template_id")
      .in("template_id", templateIds)
      .eq("is_required", true);

    if (fields) {
      fields.forEach((f) => {
        const tId = f.template_id as UUID;
        const fId = f.id as UUID;
        if (!reqFieldsMap.has(tId)) reqFieldsMap.set(tId, []);
        reqFieldsMap.get(tId)!.push(fId);
        allReqFieldIds.push(fId);
      });
    }
  }

  // 3. Ambil nilai spec produk yang sudah diisi untuk field-field required tersebut
  const filledValuesMap = new Map<UUID, Set<UUID>>();
  if (allReqFieldIds.length > 0) {
    const { data: values } = await supabase
      .from("product_spec_values")
      .select("product_id, field_id, value_text, value_number, value_boolean, value_select")
      .in("product_id", productIds)
      .in("field_id", allReqFieldIds);

    if (values) {
      values.forEach((v) => {
        const pId = v.product_id as UUID;
        const fId = v.field_id as UUID;
        const isFilled =
          (v.value_text !== null && v.value_text !== "") ||
          v.value_number !== null ||
          v.value_boolean !== null ||
          (v.value_select !== null && v.value_select !== "");

        if (isFilled) {
          if (!filledValuesMap.has(pId)) filledValuesMap.set(pId, new Set());
          filledValuesMap.get(pId)!.add(fId);
        }
      });
    }
  }

  // Hitung status kelengkapan spec per produk secara efisien di memori
  const items: ProductListItem[] = rows.map((r) => {
    const templateId = templateMap.get(r.category_id);
    const reqFieldIds = templateId ? reqFieldsMap.get(templateId) ?? [] : [];
    
    let hasRequiredSpecs = true;
    if (reqFieldIds.length > 0) {
      const filledSet = filledValuesMap.get(r.id);
      hasRequiredSpecs = reqFieldIds.every((fId) => filledSet?.has(fId));
    }

    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      category_id: r.category_id,
      category_name: r.categories?.name ?? "—",
      category_slug: r.categories?.slug ?? "",
      main_image_path: r.main_image_path,
      price: r.price ?? null,
      is_visible: r.is_visible,
      sort_order: r.sort_order,
      updated_at: r.updated_at,
      has_required_specs: hasRequiredSpecs,
    };
  });

  return { items, total: count ?? 0 };
}

/**
 * Cek apakah semua field wajib pada template kategori sudah diisi untuk produk.
 */
export async function checkRequiredSpecsFilled(
  productId: UUID,
  categoryId: UUID,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: template } = await supabase
    .from("category_spec_templates")
    .select("id, is_active")
    .eq("category_id", categoryId)
    .maybeSingle();
  if (!template || !(template as { is_active?: boolean }).is_active) return true;

  const { data: requiredFields } = await supabase
    .from("category_spec_fields")
    .select("id")
    .eq("template_id", (template as { id: UUID }).id)
    .eq("is_required", true);

  const reqIds = (requiredFields ?? []) as { id: UUID }[];
  if (reqIds.length === 0) return true;

  const { data: values } = await supabase
    .from("product_spec_values")
    .select("field_id, value_text, value_number, value_boolean, value_select")
    .eq("product_id", productId);

  const filledMap = new Map<UUID, boolean>();
  for (const v of (values ?? []) as ProductSpecValue[]) {
    if (v.value_text !== null && v.value_text !== "") filledMap.set(v.field_id, true);
    else if (v.value_number !== null) filledMap.set(v.field_id, true);
    else if (v.value_boolean !== null) filledMap.set(v.field_id, true);
    else if (v.value_select !== null && v.value_select !== "") filledMap.set(v.field_id, true);
  }

  return reqIds.every((f) => filledMap.has(f.id));
}

export interface ProductDetail {
  product: Product;
  category: { id: UUID; name: string; slug: string };
  spec_template: { id: UUID; is_active: boolean; fields: CategorySpecField[] } | null;
  spec_values: ProductSpecValue[];
  documents: ProductDocument[];
}

export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // 1. Fetch product + category in a single query with join
  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !product) throw new Error("Produk tidak ditemukan");

  const p = product as unknown as Product & { categories: { id: UUID; name: string; slug: string } | null };
  const categoryId = p.category_id;

  // 2. Parallelize remaining spec template (+fields), spec values, and documents queries
  const [templateRes, valuesRes, docsRes] = await Promise.all([
    supabase
      .from("category_spec_templates")
      .select("*, category_spec_fields(*)")
      .eq("category_id", categoryId)
      .maybeSingle(),
    supabase
      .from("product_spec_values")
      .select("*")
      .eq("product_id", id)
      .order("field_id"),
    supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
  ]);

  let spec_template: ProductDetail["spec_template"] = null;
  const template = templateRes.data as unknown as { id: UUID; is_active: boolean; category_spec_fields?: CategorySpecField[] } | null;

  if (template) {
    const fields = (template.category_spec_fields ?? []).slice();
    fields.sort((a, b) => a.sort_order - b.sort_order);
    spec_template = {
      id: template.id,
      is_active: template.is_active,
      fields,
    };
  }

  return {
    product: {
      ...p,
      gallery: parseGalleryField(p.gallery),
    } as Product,
    category: p.categories ?? {
      id: categoryId,
      name: "—",
      slug: "",
    },
    spec_template,
    spec_values: (valuesRes.data ?? []) as ProductSpecValue[],
    documents: (docsRes.data ?? []) as ProductDocument[],
  };
}

/** Safely parse the gallery field which may be a JSON string or already an array */
function parseGalleryField(raw: unknown): { path: string; alt: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as { path: string; alt: string }[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export interface SaveProductInput {
  id?: UUID;
  category_id: UUID;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  price?: number | null;
  main_image_path?: string | null;
  main_image_alt?: string;
  gallery: { path: string; alt: string }[];
  tags: string[];
  is_visible: boolean;
  sort_order: number;
  documents: {
    id?: UUID;
    label: string;
    file_path: string;
    file_size?: number | null;
    mime_type?: string | null;
    sort_order: number;
    _delete?: boolean;
  }[];
  spec_values: Record<string, string>; // fieldId -> value (string-encoded)
}

/**
 * Create atau update produk + spec values + dokumen (sinkronisasi).
 */
export async function saveProductAction(input: SaveProductInput): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Validasi slug unik
  const { data: existingSlug } = await supabase
    .from("products")
    .select("id")
    .eq("slug", input.slug)
    .eq("user_id", userId)
    .neq("id", input.id ?? "")
    .maybeSingle();
  if (existingSlug) return { ok: false, error: "Slug sudah dipakai produk lain" };

  const galleryJson = JSON.stringify(
    input.gallery.map((g) => ({ path: g.path, alt: g.alt || "" })),
  );

  const baseRow = {
    user_id: userId,
    category_id: input.category_id,
    name: input.name,
    slug: input.slug,
    summary: input.summary || null,
    description: input.description || null,
    price: input.price ?? null,
    main_image_path: input.main_image_path ?? null,
    main_image_alt: input.main_image_alt || null,
    gallery: galleryJson,
    tags: input.tags,
    is_visible: input.is_visible,
    sort_order: input.sort_order,
  };

  // Bila visible, pastikan foto utama sudah ada
  if (input.is_visible && !input.main_image_path) {
    return { ok: false, error: "Foto utama wajib sebelum produk ditampilkan" };
  }

  // Bila visible, cek spec wajib
  if (input.is_visible) {
    const ok = await validateRequiredSpecsForSave(input.category_id, input.id, input.spec_values);
    if (!ok) {
      return {
        ok: false,
        error: "Field spesifikasi wajib belum lengkap. Lengkapi sebelum menampilkan produk.",
      };
    }
  }

  let productId: UUID;

  if (input.id) {
    // Update
    const { error } = await supabase.from("products").update(baseRow).eq("id", input.id).eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    productId = input.id;
  } else {
    // Insert - Cek kuota langganan SaaS (max_products)
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("max_products, status, expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (sub) {
      if (sub.status === "suspended") {
        return { ok: false, error: "Akun toko Anda sedang ditangguhkan (Suspended). Silakan hubungi admin." };
      }

      if (sub.expires_at && new Date(sub.expires_at) < new Date()) {
        return { ok: false, error: "Masa aktif langganan Anda telah berakhir. Silakan perbarui paket langganan Anda." };
      }

      const { count: currentCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (currentCount !== null && currentCount >= sub.max_products) {
        return {
          ok: false,
          error: `Batas maksimal produk (${sub.max_products} produk) untuk paket Anda telah tercapai. Silakan upgrade paket langganan Anda.`,
        };
      }
    }

    const { data, error } = await supabase.from("products").insert(baseRow).select("id").single();
    if (error) return { ok: false, error: error.message };
    productId = (data as { id: UUID }).id;
  }

  // Sinkron spec values: upsert
  const { data: template } = await supabase
    .from("category_spec_templates")
    .select("id")
    .eq("category_id", input.category_id)
    .maybeSingle();

  if (template) {
    const tplId = (template as { id: UUID }).id;
    const { data: fields } = await supabase
      .from("category_spec_fields")
      .select("*")
      .eq("template_id", tplId);
    const fieldList = (fields ?? []) as CategorySpecField[];

    // Hapus semua spec values lama (lebih sederhana & aman untuk MVP)
    await supabase.from("product_spec_values").delete().eq("product_id", productId);

    // Insert yang baru dari input
    const toInsert: Record<string, unknown>[] = [];
    for (const field of fieldList) {
      const raw = input.spec_values[field.id];
      if (raw === undefined || raw === "") continue;
      const row: Record<string, unknown> = {
        product_id: productId,
        field_id: field.id,
      };
      if (field.field_type === "text") row.value_text = raw;
      else if (field.field_type === "number") row.value_number = Number(raw);
      else if (field.field_type === "boolean") row.value_boolean = raw === "true" || raw === "1";
      else if (field.field_type === "select") row.value_select = raw;
      toInsert.push(row);
    }
    if (toInsert.length > 0) {
      const { error: specErr } = await supabase.from("product_spec_values").insert(toInsert);
      if (specErr) return { ok: false, error: `Gagal menyimpan spec: ${specErr.message}` };
    }
  }

  // Sinkron dokumen
  if (input.id) {
    // Ambil dokumen existing untuk hapus yang tidak ada di input
    const { data: existingDocs } = await supabase
      .from("product_documents")
      .select("id, file_path")
      .eq("product_id", productId);
    const existingDocsList = (existingDocs ?? []) as { id: UUID; file_path: string }[];
    const submittedIds = new Set(
      input.documents.filter((d) => d.id && !d._delete).map((d) => d.id!),
    );
    const toDelete = existingDocsList.filter((d) => !submittedIds.has(d.id));
    for (const d of toDelete) {
      await removeFile("product-documents", d.file_path);
      await supabase.from("product_documents").delete().eq("id", d.id);
    }
  }

  // Insert/update dokumen
  for (let i = 0; i < input.documents.length; i++) {
    const doc = input.documents[i];
    if (doc._delete) continue;
    if (doc.id) {
      const { error } = await supabase
        .from("product_documents")
        .update({
          label: doc.label,
          file_path: doc.file_path,
          file_size: doc.file_size ?? null,
          mime_type: doc.mime_type ?? null,
          sort_order: doc.sort_order ?? i,
        })
        .eq("id", doc.id);
      if (error) return { ok: false, error: `Gagal update dokumen: ${error.message}` };
    } else {
      const { error } = await supabase.from("product_documents").insert({
        product_id: productId,
        label: doc.label,
        file_path: doc.file_path,
        file_size: doc.file_size ?? null,
        mime_type: doc.mime_type ?? null,
        sort_order: doc.sort_order ?? i,
      });
      if (error) return { ok: false, error: `Gagal menambah dokumen: ${error.message}` };
    }
  }

  revalidatePath("/admin/products");
  return { ok: true };
}

async function validateRequiredSpecsForSave(
  categoryId: UUID,
  productId: UUID | undefined,
  specValues: Record<string, string>,
): Promise<boolean> {
  const supabase = await createClient();
  const { data: template } = await supabase
    .from("category_spec_templates")
    .select("id, is_active")
    .eq("category_id", categoryId)
    .maybeSingle();
  if (!template || !(template as { is_active?: boolean }).is_active) return true;

  const tplId = (template as { id: UUID; is_active: boolean }).id;
  const { data: requiredFields } = await supabase
    .from("category_spec_fields")
    .select("id")
    .eq("template_id", tplId)
    .eq("is_required", true);

  const reqIds = (requiredFields ?? []) as { id: UUID }[];
  return reqIds.every((f) => {
    const v = specValues[f.id];
    return v !== undefined && v !== "";
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Ambil main image & gallery untuk dihapus dari storage
  const { data: product } = await supabase
    .from("products")
    .select("main_image_path, gallery")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  const p = product as { main_image_path: string | null; gallery: unknown } | null;
  if (p) {
    if (p.main_image_path) await removeFile("product-images", p.main_image_path);
    // gallery may be stored as a JSON string — parse safely
    let galleryArr: { path: string }[] = [];
    if (Array.isArray(p.gallery)) {
      galleryArr = p.gallery as { path: string }[];
    } else if (typeof p.gallery === "string") {
      try { galleryArr = JSON.parse(p.gallery); } catch { /* ignore */ }
    }
    for (const g of galleryArr) {
      if (g?.path) await removeFile("product-images", g.path);
    }
  }

  // Ambil dokumen
  const { data: docs } = await supabase
    .from("product_documents")
    .select("file_path")
    .eq("product_id", id);
  for (const d of (docs ?? []) as { file_path: string }[]) {
    await removeFile("product-documents", d.file_path);
  }

  const { error } = await supabase.from("products").delete().eq("id", id).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function bulkDeleteProductsAction(ids: string[]): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  if (!ids || ids.length === 0) return { ok: false, error: "Tidak ada produk dipilih" };

  const supabase = await createClient();

  // Fetch all products to get their assets
  const { data: products } = await supabase
    .from("products")
    .select("id, main_image_path, gallery")
    .in("id", ids)
    .eq("user_id", userId);

  for (const product of (products ?? []) as { id: string; main_image_path: string | null; gallery: unknown }[]) {
    if (product.main_image_path) {
      await removeFile("product-images", product.main_image_path);
    }
    let galleryArr: { path: string }[] = [];
    if (Array.isArray(product.gallery)) {
      galleryArr = product.gallery as { path: string }[];
    } else if (typeof product.gallery === "string") {
      try { galleryArr = JSON.parse(product.gallery); } catch { /* ignore */ }
    }
    for (const g of galleryArr) {
      if (g?.path) await removeFile("product-images", g.path);
    }
  }

  // Delete all documents attached to these products
  const { data: docs } = await supabase
    .from("product_documents")
    .select("file_path")
    .in("product_id", ids);
  for (const d of (docs ?? []) as { file_path: string }[]) {
    await removeFile("product-documents", d.file_path);
  }

  const { error } = await supabase.from("products").delete().in("id", ids).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  return { ok: true };
}


export async function toggleProductVisibleAction(
  id: string,
  is_visible: boolean,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Bila mau tampilkan, pastikan foto utama & spec wajib
  if (is_visible) {
    const { data: product } = await supabase
      .from("products")
      .select("main_image_path, category_id")
      .eq("id", id)
      .single();
    const p = product as { main_image_path: string | null; category_id: UUID } | null;
    if (!p?.main_image_path) {
      return { ok: false, error: "Foto utama wajib sebelum produk ditampilkan" };
    }
    // Ambil nilai spec saat ini (dari DB) untuk cek wajib
    const ok = await checkRequiredSpecsFilled(id, p.category_id);
    if (!ok) {
      return { ok: false, error: "Field spesifikasi wajib belum lengkap" };
    }
  }

  const { error } = await supabase
    .from("products")
    .update({ is_visible })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

/**
 * Upload asset produk (foto utama, galeri, dokumen). Mengembalikan path publik.
 * Dipanggil dari client upload component.
 */
export async function uploadProductImageAction(file: File): Promise<
  { ok: true; path: string } | { ok: false; error: string }
> {
  await requireAdmin();
  try {
    const upload = await uploadFile("product-images", file, "prod");
    return { ok: true, path: upload.path };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload gagal",
    };
  }
}

export async function uploadProductDocumentAction(
  file: File,
): Promise<{ ok: true; path: string; size: number; mime: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const upload = await uploadFile("product-documents", file, "doc");
    return { ok: true, path: upload.path, size: upload.size, mime: upload.mime };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload gagal",
    };
  }
}

export async function removeProductAssetAction(
  bucket: "product-images" | "product-documents",
  path: string,
): Promise<ActionResult> {
  await requireAdmin();
  await removeFile(bucket, path);
  return { ok: true };
}

export interface BulkImportProductInput {
  _rowIndex: number;
  name: string;
  category_slug: string;
  slug?: string;
  summary?: string;
  description?: string;
  is_visible?: boolean;
  sort_order?: number;
  main_image_path?: string;
  gallery?: { path: string; alt: string }[];
  tags?: string[];
}

export type BulkImportResult = {
  ok: boolean;
  total: number;
  successCount: number;
  failedCount: number;
  errors: { rowIndex: number; name: string; reason: string }[];
  error?: string; // For system-level errors
};

export async function bulkImportProductsAction(items: BulkImportProductInput[]): Promise<BulkImportResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  if (items.length === 0) return { ok: false, total: 0, successCount: 0, failedCount: 0, errors: [], error: "Data kosong" };

  // Build category map from existing categories (keyed by slug AND by name lowercase)
  const { data: categories } = await supabase.from("categories").select("id, slug, name").eq("user_id", userId);
  const categoryMap = new Map<string, UUID>(); // key: slug or name_lower → id
  for (const c of (categories ?? []) as { id: UUID; slug: string; name: string }[]) {
    categoryMap.set(c.slug.toLowerCase(), c.id);
    categoryMap.set(c.name.toLowerCase(), c.id);
  }

  // Track newly created category slugs in this run to avoid duplicate inserts
  const createdCategories = new Map<string, UUID>(); // slug → id

  const errors: { rowIndex: number; name: string; reason: string }[] = [];
  let successCount = 0;

  for (const item of items) {
    if (!item.name) {
      errors.push({
        rowIndex: item._rowIndex,
        name: "N/A",
        reason: "Nama produk wajib diisi",
      });
      continue;
    }

    // Resolve category: allow by slug or by name, or auto-create
    let category_id: UUID | undefined;

    if (item.category_slug) {
      const key = item.category_slug.trim().toLowerCase();

      // 1. Try exact slug/name match in existing categories
      if (categoryMap.has(key)) {
        category_id = categoryMap.get(key);
      }
      // 2. Try previously created categories in this import run
      else if (createdCategories.has(key)) {
        category_id = createdCategories.get(key);
      }
      // 3. Auto-create new category
      else {
        const newSlug = item.category_slug
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

        // Humanize name: capitalize words
        const newName = item.category_slug
          .trim()
          .split(/[-_\s]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const { data: newCat, error: catErr } = await supabase
          .from("categories")
          .insert({
            user_id: userId,
            slug: newSlug,
            name: newName,
            is_visible: true,
            sort_order: 0,
          })
          .select("id")
          .single();

        if (catErr || !newCat) {
          // Might have failed due to duplicate slug — try to fetch it
          const { data: existingCat } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", newSlug)
            .eq("user_id", userId)
            .single();
          if (existingCat) {
            category_id = (existingCat as { id: UUID }).id;
          } else {
            errors.push({
              rowIndex: item._rowIndex,
              name: item.name,
              reason: `Gagal membuat kategori '${item.category_slug}': ${catErr?.message ?? "tidak diketahui"}`,
            });
            continue;
          }
        } else {
          category_id = (newCat as { id: UUID }).id;
        }

        // Cache new category so subsequent rows can reuse it
        createdCategories.set(key, category_id!);
        categoryMap.set(newSlug, category_id!);
      }
    } else {
      // No category given — use or create a default "Uncategorized" category
      const defaultKey = "uncategorized";
      if (categoryMap.has(defaultKey)) {
        category_id = categoryMap.get(defaultKey);
      } else if (createdCategories.has(defaultKey)) {
        category_id = createdCategories.get(defaultKey);
      } else {
        const { data: defCat, error: defErr } = await supabase
          .from("categories")
          .insert({ user_id: userId, slug: "uncategorized", name: "Uncategorized", is_visible: true, sort_order: 999 })
          .select("id")
          .single();
        if (defErr || !defCat) {
          const { data: existingDef } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", "uncategorized")
            .eq("user_id", userId)
            .single();
          category_id = existingDef ? (existingDef as { id: UUID }).id : undefined;
        } else {
          category_id = (defCat as { id: UUID }).id;
        }
        if (category_id) {
          createdCategories.set(defaultKey, category_id);
          categoryMap.set(defaultKey, category_id);
        }
      }

      if (!category_id) {
        errors.push({
          rowIndex: item._rowIndex,
          name: item.name,
          reason: "Kategori tidak diisi dan gagal membuat kategori default",
        });
        continue;
      }
    }

    let slug = item.slug;
    if (!slug) {
      slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      slug += "-" + Math.floor(Math.random() * 10000).toString();
    }

    const row = {
      user_id: userId,
      category_id,
      name: item.name,
      slug: slug,
      summary: item.summary || null,
      description: item.description || null,
      main_image_path: item.main_image_path || null,
      is_visible: item.is_visible ?? false,
      sort_order: item.sort_order ?? 0,
      tags: item.tags ?? [],
      gallery: item.gallery ? JSON.stringify(item.gallery) : "[]",
    };

    const { error: insertError } = await supabase.from("products").insert(row);
    if (insertError) {
      errors.push({
        rowIndex: item._rowIndex,
        name: item.name,
        reason: insertError.message,
      });
    } else {
      successCount++;
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");

  return {
    ok: successCount > 0,
    total: items.length,
    successCount,
    failedCount: errors.length,
    errors,
  };
}

export async function bulkUpdateProductsFromExcelAction(formData: FormData): Promise<BulkImportResult> {
  const { userId } = await requireAdmin();
  const file = formData.get("file") as File | null;
  
  if (!file) {
    return { ok: false, total: 0, successCount: 0, failedCount: 0, errors: [], error: "File tidak ditemukan" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const workbook = xlsx.read(buffer, { type: "buffer" });
    
    if (workbook.SheetNames.length === 0) {
      return { ok: false, total: 0, successCount: 0, failedCount: 0, errors: [], error: "File Excel kosong" };
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(worksheet) as any[];
    
    if (rows.length === 0) {
      return { ok: false, total: 0, successCount: 0, failedCount: 0, errors: [], error: "Tidak ada baris data di file Excel" };
    }

    const supabase = await createClient();
    const errors: { rowIndex: number; name: string; reason: string }[] = [];
    let successCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowIndex = i + 2; // +1 for 0-index to 1-index, +1 for header row
      
      const id = row["ID"] || row["id"];
      const name = row["Nama Produk"] || row["name"] || "N/A";
      
      if (!id) {
        errors.push({ rowIndex, name, reason: "Kolom ID kosong. Abaikan baris ini." });
        continue;
      }
      
      const updateData: Record<string, any> = {};
      
      if (row["Nama Produk"] !== undefined) updateData.name = row["Nama Produk"];
      if (row["Slug"] !== undefined) updateData.slug = row["Slug"];
      if (row["Harga (Rp)"] !== undefined) {
        const priceVal = row["Harga (Rp)"];
        updateData.price = (priceVal === "" || priceVal === null) ? null : Number(priceVal);
      }
      if (row["Tampilkan di Toko"] !== undefined) {
        const vis = row["Tampilkan di Toko"];
        updateData.is_visible = (vis === "Ya" || vis === true || vis === 1 || vis === "Y");
      }
      if (row["Urutan Tampil"] !== undefined) {
        updateData.sort_order = Number(row["Urutan Tampil"]);
      }
      
      if (Object.keys(updateData).length === 0) {
        errors.push({ rowIndex, name, reason: "Tidak ada kolom yang bisa di-update" });
        continue;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId);
        
      if (updateError) {
        errors.push({ rowIndex, name, reason: updateError.message });
      } else {
        successCount++;
      }
    }
    
    revalidatePath("/admin/products");
    
    return {
      ok: successCount > 0 || errors.length === 0,
      total: rows.length,
      successCount,
      failedCount: errors.length,
      errors,
    };
  } catch (err: any) {
    console.error("Import error:", err);
    return { 
      ok: false, 
      total: 0, 
      successCount: 0, 
      failedCount: 0, 
      errors: [], 
      error: err.message || "Gagal memproses file" 
    };
  }
}