"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { siteSettingsSchema } from "@/lib/validators/site-settings";
import { uploadFile, removeFile } from "@/lib/storage";
import type { SiteSettings } from "@/lib/db/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data as SiteSettings | null;
}

export async function saveSiteSettingsAction(
  formData: FormData,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();

  const parsed = siteSettingsSchema.safeParse({
    brand_name: formData.get("brand_name"),
    brand_tagline: formData.get("brand_tagline") || undefined,
    contact_email: formData.get("contact_email") || undefined,
    contact_phone: formData.get("contact_phone") || undefined,
    contact_address: formData.get("contact_address") || undefined,
    whatsapp_number: formData.get("whatsapp_number"),
    whatsapp_template: formData.get("whatsapp_template"),
    seo_title: formData.get("seo_title") || undefined,
    seo_description: formData.get("seo_description") || undefined,
    show_prices: formData.get("show_prices") === "true",
    catalog_announcement_title: formData.get("catalog_announcement_title") || undefined,
    catalog_announcement_message: formData.get("catalog_announcement_message") || undefined,
    catalog_announcement_enabled: formData.get("catalog_announcement_enabled") === "true",
    social_instagram: formData.get("social_instagram") || undefined,
    social_tiktok: formData.get("social_tiktok") || undefined,
    social_shopee: formData.get("social_shopee") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      brand_name: parsed.data.brand_name,
      brand_tagline: parsed.data.brand_tagline || null,
      contact_email: parsed.data.contact_email || null,
      contact_phone: parsed.data.contact_phone || null,
      contact_address: parsed.data.contact_address || null,
      whatsapp_number: parsed.data.whatsapp_number,
      whatsapp_template: parsed.data.whatsapp_template,
      seo_title: parsed.data.seo_title || null,
      seo_description: parsed.data.seo_description || null,
      show_prices: parsed.data.show_prices,
      catalog_announcement_title: parsed.data.catalog_announcement_title || null,
      catalog_announcement_message: parsed.data.catalog_announcement_message || null,
      catalog_announcement_enabled: parsed.data.catalog_announcement_enabled,
      social_instagram: parsed.data.social_instagram || null,
      social_tiktok: parsed.data.social_tiktok || null,
      social_shopee: parsed.data.social_shopee || null,
    })
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Upload logo brand ke storage dan simpan path ke site_settings.
 */
export async function uploadBrandLogoAction(
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "File tidak ditemukan" };
  }
  const { userId } = await requireAdmin();

  // Validasi tipe file
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "File harus berupa gambar (PNG, JPG, SVG, WebP)" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Ukuran logo maksimal 5MB. Silakan kompres gambar Anda." };
  }

  try {
    const upload = await uploadFile("brand-assets", file, "logo");

    // Hapus logo lama jika ada
    const supabase = await createClient();
    const { data: current } = await supabase
      .from("site_settings")
      .select("brand_logo_path")
      .eq("user_id", userId)
      .single();

    const oldPath = (current as { brand_logo_path: string | null } | null)?.brand_logo_path;
    if (oldPath) {
      await removeFile("brand-assets", oldPath);
    }

    // Simpan path baru
    const { error } = await supabase
      .from("site_settings")
      .update({ brand_logo_path: upload.path })
      .eq("user_id", userId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true, path: upload.path };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload gagal",
    };
  }
}

/**
 * Hapus logo brand dari storage dan set path ke null.
 */
export async function removeBrandLogoAction(): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("site_settings")
    .select("brand_logo_path")
    .eq("user_id", userId)
    .single();

  const oldPath = (current as { brand_logo_path: string | null } | null)?.brand_logo_path;
  if (oldPath) {
    await removeFile("brand-assets", oldPath);
  }

  const { error } = await supabase
    .from("site_settings")
    .update({ brand_logo_path: null })
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

/**
 * Upload foto banner pengumuman katalog ke storage.
 * Menggunakan bucket `landing-media` yang sudah ada di Supabase.
 */
export async function uploadAnnouncementBannerAction(
  formData: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "File tidak ditemukan" };
  }
  try {
    const { userId } = await requireAdmin();

    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "File harus berupa gambar (PNG, JPG, WebP, SVG)" };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: "Ukuran foto banner maksimal 5MB. Silakan kompres gambar Anda terlebih dahulu." };
    }

    const upload = await uploadFile("landing-media", file, "announcement-banner");

    const supabase = await createClient();

    // Hapus banner lama jika ada
    try {
      const { data: current } = await supabase
        .from("site_settings")
        .select("catalog_announcement_image_path")
        .eq("user_id", userId)
        .maybeSingle();

      const oldPath = (current as { catalog_announcement_image_path?: string | null } | null)?.catalog_announcement_image_path;
      if (oldPath) {
        await removeFile("landing-media", oldPath);
      }
    } catch {
      // Kolom mungkin belum ada
    }

    const { error } = await supabase
      .from("site_settings")
      .update({ catalog_announcement_image_path: upload.path })
      .eq("user_id", userId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true, path: upload.path };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload gagal. Periksa koneksi internet.",
    };
  }
}

/**
 * Hapus foto banner pengumuman dari storage.
 */
export async function removeAnnouncementBannerAction(): Promise<ActionResult> {
  try {
    const { userId } = await requireAdmin();
    const supabase = await createClient();

    try {
      const { data: current } = await supabase
        .from("site_settings")
        .select("catalog_announcement_image_path")
        .eq("user_id", userId)
        .maybeSingle();

      const oldPath = (current as { catalog_announcement_image_path?: string | null } | null)?.catalog_announcement_image_path;
      if (oldPath) {
        await removeFile("landing-media", oldPath);
      }
    } catch {
      // Abaikan
    }

    const { error } = await supabase
      .from("site_settings")
      .update({ catalog_announcement_image_path: null })
      .eq("user_id", userId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal menghapus foto banner" };
  }
}

/**
 * Upload gambar banner promo Hero ke storage (maksimal 2MB per gambar).
 */
export async function uploadHeroBannerImageAction(
  formData: FormData,
  bannerId: string
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "File gambar tidak ditemukan" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "File harus berupa gambar (JPG, PNG, WebP)" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { ok: false, error: "Ukuran berkas banner maksimal 2MB. Silakan kompres gambar Anda." };
  }

  try {
    const { userId } = await requireAdmin();
    const upload = await uploadFile("landing-media", file, `hero-${bannerId}`);
    return { ok: true, path: upload.path };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal upload gambar banner" };
  }
}

/**
 * Simpan konfigurasi Hero Banners ke landing_sections (section_key: hero, config.hero_banners)
 */
export async function saveHeroBannersConfigAction(banners: any[]): Promise<ActionResult> {
  try {
    const { userId } = await requireAdmin();
    const supabase = await createClient();

    const { data: currentHero } = await supabase
      .from("landing_sections")
      .select("id, config")
      .eq("user_id", userId)
      .eq("section_key", "hero")
      .maybeSingle();

    const existingConfig = (currentHero?.config as Record<string, unknown>) || {};
    const updatedConfig = { ...existingConfig, hero_banners: banners };

    if (currentHero) {
      const { error } = await supabase
        .from("landing_sections")
        .update({ config: updatedConfig })
        .eq("id", currentHero.id);

      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("landing_sections").insert({
        user_id: userId,
        section_key: "hero",
        heading: "Katalog Produk & Etalase Online Resmi",
        subheading: "Temukan produk pilihan lengkap dengan spesifikasi detail.",
        config: updatedConfig,
        is_visible: true,
        sort_order: 1,
      });

      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Gagal menyimpan konfigurasi banner" };
  }
}