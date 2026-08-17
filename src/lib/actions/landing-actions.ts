"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type {
  LandingSection,
  LandingSectionKey,
  Category,
  Product,
  UUID,
} from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface LandingSectionFull extends LandingSection {
  config: Record<string, unknown>;
}

/**
 * Ambil semua landing section, urut sort_order.
 */
export async function fetchLandingSections(): Promise<LandingSectionFull[]> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("landing_sections")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as LandingSectionFull[];
}

export async function fetchLandingSection(
  sectionKey: LandingSectionKey,
): Promise<LandingSectionFull | null> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("landing_sections")
    .select("*")
    .eq("section_key", sectionKey)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as LandingSectionFull | null;
}

export async function toggleLandingSectionAction(
  sectionKey: LandingSectionKey,
  isVisible: boolean,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("landing_sections")
    .update({ is_visible: isVisible })
    .eq("section_key", sectionKey)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/landing");
  return { ok: true };
}

export async function reorderLandingSectionsAction(
  orderedKeys: LandingSectionKey[],
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  // Update satu per satu dengan sort_order dari index array
  for (let i = 0; i < orderedKeys.length; i++) {
    const { error } = await supabase
      .from("landing_sections")
      .update({ sort_order: (i + 1) * 10 })
      .eq("section_key", orderedKeys[i])
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/landing");
  return { ok: true };
}

/**
 * Simpan satu section dengan config dinamis.
 */
export async function saveLandingSectionAction(
  sectionKey: LandingSectionKey,
  payload: {
    heading?: string;
    subheading?: string;
    body?: string;
    config?: Record<string, unknown>;
  },
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("landing_sections")
    .update({
      heading: payload.heading ?? null,
      subheading: payload.subheading ?? null,
      body: payload.body ?? null,
      config: payload.config ?? {},
    })
    .eq("section_key", sectionKey)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/landing");
  return { ok: true };
}

/**
 * Ambil daftar kategori yang visible untuk dipilih sebagai "kategori unggulan".
 */
export async function fetchFeaturedCategoryOptions(): Promise<
  { id: UUID; name: string; slug: string; image_path: string | null }[]
> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_path")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: UUID; name: string; slug: string; image_path: string | null }[];
}

/**
 * Ambil daftar produk yang visible (publik-ready) untuk dipilih sebagai "produk pilihan".
 */
export async function fetchFeaturedProductOptions(): Promise<
  { id: UUID; name: string; slug: string; main_image_path: string | null }[]
> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, main_image_path")
    .eq("is_visible", true)
    .eq("user_id", userId)
    .not("main_image_path", "is", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: UUID; name: string; slug: string; main_image_path: string | null }[];
}

/* ------------------------------------------------------------------ */
/*  Category Template Actions                                         */
/* ------------------------------------------------------------------ */

/**
 * Ambil info template yang sedang diterapkan dari site_settings.
 */
export async function fetchCurrentTemplateInfo(): Promise<{
  category_slug: string | null;
  language: string;
}> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("category_slug, language")
    .eq("user_id", userId)
    .single();

  return {
    category_slug: (data as { category_slug: string | null; language: string } | null)?.category_slug ?? null,
    language: (data as { category_slug: string | null; language: string } | null)?.language ?? "id",
  };
}

/**
 * Terapkan template kategori ke 7 landing sections milik user.
 *
 * Alur:
 * 1. Backup seluruh section saat ini ke landing_sections_backup.
 * 2. Update heading/subheading/body/config dari data template.
 * 3. Update site_settings.category_slug & language.
 * 4. Revalidate paths.
 */
export async function applyCategoryTemplateAction(
  templateSlug: string,
  language: string,
): Promise<ActionResult> {
  // Dynamic import untuk menghindari bundle bloat di setiap server action
  const { CATEGORY_TEMPLATES } = await import("@/lib/category-templates");

  const template = CATEGORY_TEMPLATES[templateSlug as keyof typeof CATEGORY_TEMPLATES];
  if (!template) {
    return { ok: false, error: `Template "${templateSlug}" tidak ditemukan.` };
  }

  const lang = language === "su" ? "su" : "id";
  const sectionData = template.sections[lang];
  if (!sectionData) {
    return { ok: false, error: `Bahasa "${language}" tidak tersedia untuk template ini.` };
  }

  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // 1. Ambil section saat ini untuk backup
  const { data: currentSections, error: fetchErr } = await supabase
    .from("landing_sections")
    .select("*")
    .eq("user_id", userId);

  if (fetchErr) return { ok: false, error: fetchErr.message };

  // 2. Backup ke landing_sections_backup
  if (currentSections && currentSections.length > 0) {
    const backupRows = currentSections.map((s: Record<string, unknown>) => ({
      user_id: userId,
      section_key: s.section_key as string,
      heading: s.heading as string | null,
      subheading: s.subheading as string | null,
      body: s.body as string | null,
      config: s.config ?? {},
      is_visible: s.is_visible as boolean,
      sort_order: s.sort_order as number,
    }));

    const { error: backupErr } = await supabase
      .from("landing_sections_backup")
      .insert(backupRows);

    if (backupErr) {
      return { ok: false, error: `Backup gagal: ${backupErr.message}` };
    }
  }

  // 3. Update setiap section dari template data
  const sectionKeys = Object.keys(sectionData) as LandingSectionKey[];
  for (const key of sectionKeys) {
    const data = sectionData[key];
    const { error: updateErr } = await supabase
      .from("landing_sections")
      .update({
        heading: data.heading || null,
        subheading: data.subheading || null,
        body: data.body || null,
        config: data.config ?? {},
      })
      .eq("section_key", key)
      .eq("user_id", userId);

    if (updateErr) {
      return { ok: false, error: `Gagal update section "${key}": ${updateErr.message}` };
    }
  }

  // 4. Update site_settings: category_slug + language
  const { error: settingsErr } = await supabase
    .from("site_settings")
    .update({ category_slug: templateSlug, language: lang })
    .eq("user_id", userId);

  if (settingsErr) {
    return { ok: false, error: `Gagal update settings: ${settingsErr.message}` };
  }

  revalidatePath("/admin/landing");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true };
}