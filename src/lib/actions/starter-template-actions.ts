"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { STARTER_STORE_PRESETS } from "@/lib/starter-store-templates";
import { applyCategoryTemplateAction } from "@/lib/actions/landing-actions";

export type ActionResult = { 
  ok: true; 
  categoriesCount: number; 
  productsCount: number;
} | { 
  ok: false; 
  error: string; 
};

/**
 * Menerapkan Full Starter Store Preset (Brand Info, Categories, Sample Products, Landing Page)
 * untuk toko UMKM.
 */
export async function applyStarterStorePresetAction(opts: {
  presetId: string;
  clearExisting?: boolean;
}): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = createAdminClient();

  const preset = STARTER_STORE_PRESETS[opts.presetId];
  if (!preset) {
    return { ok: false, error: `Preset "${opts.presetId}" tidak ditemukan.` };
  }

  try {
    // 1. Ambil data toko & site_settings saat ini
    const { data: settings } = await supabase
      .from("site_settings")
      .select("id, brand_name, brand_tagline, whatsapp_template")
      .eq("id", 1)
      .maybeSingle();

    const storeBrandName = settings?.brand_name || "Toko Kami";

    // Format WhatsApp template dengan nama brand toko
    const formattedWaTemplate = preset.brandPreset.whatsappTemplate.replace(
      /\[nama toko\]/gi,
      storeBrandName
    );

    // Update site_settings
    await supabase
      .from("site_settings")
      .update({
        brand_tagline: settings?.brand_tagline || preset.brandPreset.tagline,
        whatsapp_template: formattedWaTemplate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    // 2. Bersihkan produk & kategori lama jika opsi clearExisting diaktifkan
    if (opts.clearExisting) {
      await supabase.from("products").delete().eq("user_id", userId);
      await supabase.from("categories").delete().eq("user_id", userId);
    }

    // 3. Insert Kategori Sampel
    const createdCategoryMap = new Map<number, string>(); // index -> category_id
    const timeStamp = Date.now().toString().slice(-5);

    for (let i = 0; i < preset.categories.length; i++) {
      const catPreset = preset.categories[i];
      const categorySlug = catPreset.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { data: newCat, error: catErr } = await supabase
        .from("categories")
        .insert({
          user_id: userId,
          name: catPreset.name,
          slug: `${categorySlug}-${timeStamp}-${i + 1}`,
          is_visible: true,
          sort_order: catPreset.sortOrder,
        })
        .select("id")
        .single();

      if (catErr || !newCat) {
        console.error(`Error creating category preset ${catPreset.name}:`, catErr?.message);
        continue;
      }

      createdCategoryMap.set(i, newCat.id);
    }

    // 4. Insert Produk Sampel
    let createdProductsCount = 0;

    for (let j = 0; j < preset.products.length; j++) {
      const prodPreset = preset.products[j];
      const targetCategoryId = createdCategoryMap.get(prodPreset.categoryIndex);
      if (!targetCategoryId) continue;

      const productSlug = prodPreset.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const { error: prodErr } = await supabase.from("products").insert({
        user_id: userId,
        category_id: targetCategoryId,
        name: prodPreset.name,
        slug: `${productSlug}-${timeStamp}-${j + 1}`,
        description: prodPreset.description,
        price: prodPreset.price,
        main_image_path: prodPreset.imageUrl,
        is_visible: true,
        sort_order: createdProductsCount + 1,
      });

      if (prodErr) {
        console.error(`Error creating product preset ${prodPreset.name}:`, prodErr.message);
      } else {
        createdProductsCount++;
      }
    }

    // 5. Terapkan Landing Page Sections dari Template Kategori
    if (preset.landingTemplateSlug) {
      await applyCategoryTemplateAction(preset.landingTemplateSlug, "id");
    }

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/promo");
    revalidatePath("/portofolio");

    return {
      ok: true,
      categoriesCount: createdCategoryMap.size,
      productsCount: createdProductsCount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengaplikasikan preset toko.";
    return { ok: false, error: message };
  }
}
