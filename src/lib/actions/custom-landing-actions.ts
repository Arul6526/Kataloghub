"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sanitizeHtml, sanitizeCss, stripJavaScript } from "@/lib/security/sanitizer";
import type { CustomLandingPage, UUID } from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface CustomLandingPageListItem {
  id: UUID;
  title: string;
  slug: string;
  is_active: boolean;
  product_ids: UUID[];
  meta_title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Ambil semua custom landing pages (untuk list admin).
 */
export async function fetchCustomLandingPages(): Promise<CustomLandingPageListItem[]> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_landing_pages")
    .select("id, title, slug, is_active, product_ids, meta_title, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CustomLandingPageListItem[];
}

/**
 * Ambil satu custom landing page by ID (untuk editor admin).
 */
export async function fetchCustomLandingPage(id: string): Promise<CustomLandingPage | null> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("custom_landing_pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as CustomLandingPage | null;
}

/**
 * Ambil satu custom landing page by slug (untuk public route).
 */
export async function fetchCustomLandingPageBySlug(
  slug: string,
  storeSlug?: string,
): Promise<CustomLandingPage | null> {
  const supabase = createAdminClient();

  let ownerId: string | null = null;
  if (storeSlug) {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("user_id")
      .eq("store_slug", storeSlug)
      .maybeSingle();
    ownerId = settings?.user_id ?? null;
    if (!ownerId) return null;
  }

  let query = supabase
    .from("custom_landing_pages")
    .select("*")
    .eq("slug", slug);

  if (ownerId) {
    query = query.eq("user_id", ownerId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data as CustomLandingPage | null;
}

export interface SaveCustomLandingPageInput {
  id?: UUID;
  title: string;
  slug: string;
  html_source: string;
  css_source: string;
  js_source: string;
  is_active: boolean;
  product_ids: UUID[];
  meta_title?: string;
  meta_description?: string;
}

/**
 * Create atau update custom landing page.
 */
export async function saveCustomLandingPageAction(
  input: SaveCustomLandingPageInput,
): Promise<ActionResult & { id?: UUID }> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Validasi slug unik
  const { data: existingSlug } = await supabase
    .from("custom_landing_pages")
    .select("id")
    .eq("slug", input.slug)
    .eq("user_id", userId)
    .neq("id", input.id ?? "")
    .maybeSingle();
  if (existingSlug) return { ok: false, error: "Slug sudah dipakai halaman lain" };

  // ── SECURITY: Sanitize all user-provided HTML/CSS/JS ──
  const safeHtml = sanitizeHtml(input.html_source);
  const safeCss = sanitizeCss(input.css_source);
  const safeJs = stripJavaScript(input.js_source);

  const row = {
    user_id: userId,
    title: input.title,
    slug: input.slug,
    html_source: safeHtml,
    css_source: safeCss,
    js_source: safeJs,
    is_active: input.is_active,
    product_ids: input.product_ids,
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
  };

  if (input.id) {
    const { error } = await supabase
      .from("custom_landing_pages")
      .update(row)
      .eq("id", input.id)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/custom-pages");
    revalidatePath(`/lp/${input.slug}`);
    return { ok: true, id: input.id };
  } else {
    const { data, error } = await supabase
      .from("custom_landing_pages")
      .insert(row)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/custom-pages");
    return { ok: true, id: (data as { id: UUID }).id };
  }
}

/**
 * Hapus custom landing page.
 */
export async function deleteCustomLandingPageAction(id: string): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("custom_landing_pages").delete().eq("id", id).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/custom-pages");
  return { ok: true };
}

/**
 * Toggle aktif/nonaktif custom landing page.
 */
export async function toggleCustomLandingPageAction(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_landing_pages")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/custom-pages");
  return { ok: true };
}

/**
 * Revert to default landing page by deactivating the 'home' custom page.
 */
export async function revertToDefaultLandingPageAction(): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_landing_pages")
    .update({ is_active: false })
    .eq("slug", "home")
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/custom-pages");
  return { ok: true };
}

/**
 * Ambil produk yang terhubung ke landing page (berdasarkan product_ids array).
 * Dipakai untuk substitusi placeholder di public route.
 */
export async function fetchLinkedProducts(productIds: UUID[]): Promise<
  {
    id: UUID;
    name: string;
    slug: string;
    summary: string | null;
    main_image_path: string | null;
    main_image_alt: string | null;
    category_slug: string;
  }[]
> {
  if (!productIds || productIds.length === 0) return [];
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, summary, main_image_path, main_image_alt, categories!inner(slug)")
    .in("id", productIds);
  if (error) return [];
  return ((data ?? []) as unknown as {
    id: UUID;
    name: string;
    slug: string;
    summary: string | null;
    main_image_path: string | null;
    main_image_alt: string | null;
    categories: { slug: string };
  }[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    main_image_path: p.main_image_path,
    main_image_alt: p.main_image_alt,
    category_slug: p.categories?.slug ?? "",
  }));
}
