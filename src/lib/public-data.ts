import { createAdminClient } from "@/lib/supabase/server";
import { sanitizeSearchInput } from "@/lib/security/input-validator";
import { cache } from "react";
import type {
  Category,
  Product,
  ProductSpecValue,
  CategorySpecField,
  ProductDocument,
  LandingSection,
  SiteSettings,
  CategorySpecTemplate,
  UUID,
} from "@/lib/db/types";

// Helper internal untuk mendapatkan user_id pemilik toko dari store_slug (deduplicated per render cycle)
const getStoreOwnerId = cache(async function getStoreOwnerId(slug: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("user_id")
    .eq("store_slug", slug)
    .maybeSingle();
  return data?.user_id ?? null;
});

/* ---------- Site Settings ---------- */

export const getSiteSettings = cache(async function getSiteSettings(storeSlug: string): Promise<SiteSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("store_slug", storeSlug)
    .maybeSingle();
  if (error) console.error("[getSiteSettings]", error.message);
  return (data as SiteSettings) ?? null;
});

/* ---------- Landing Sections ---------- */

export interface LandingSectionFull extends LandingSection {
  config: Record<string, unknown>;
}

export async function getLandingSections(storeSlug: string): Promise<LandingSectionFull[]> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("landing_sections")
    .select("*")
    .eq("user_id", ownerId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  if (error) console.error("[getLandingSections]", error.message);
  return (data ?? []) as LandingSectionFull[];
}

/* ---------- Categories ---------- */

export interface PublicCategory {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  image_alt: string | null;
  sort_order: number;
  product_count: number;
}

export async function getVisibleCategories(storeSlug: string): Promise<PublicCategory[]> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return [];

  const supabase = createAdminClient();
  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, image_alt, sort_order")
    .eq("user_id", ownerId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (catError) {
    console.error("[getVisibleCategories]", catError.message);
    return [];
  }
  if (!categories || categories.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("category_id")
    .eq("user_id", ownerId)
    .eq("is_visible", true);

  const counts: Record<string, number> = {};
  for (const p of (products ?? []) as { category_id: string }[]) {
    counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  }

  return (categories as Category[]).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_path: c.image_path,
    image_alt: c.image_alt,
    sort_order: c.sort_order,
    product_count: counts[c.id] ?? 0,
  }));
}

export async function getCategoryBySlug(storeSlug: string, categorySlug: string): Promise<PublicCategory | null> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return null;

  const supabase = createAdminClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_path, image_alt, sort_order")
    .eq("user_id", ownerId)
    .eq("slug", categorySlug)
    .eq("is_visible", true)
    .single();
  if (!cat) return null;

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ownerId)
    .eq("category_id", (cat as Category).id)
    .eq("is_visible", true);

  return {
    ...(cat as Category),
    product_count: count ?? 0,
  };
}

/* ---------- Products ---------- */

export interface PublicProductListItem {
  id: UUID;
  name: string;
  slug: string;
  summary: string | null;
  main_image_path: string | null;
  main_image_alt: string | null;
  price: number | null;
  tags: string[];
  sort_order: number;
  category_name: string;
  category_slug: string;
}

export async function getVisibleProducts(
  storeSlug: string,
  opts?: {
    search?: string;
    categorySlug?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ items: PublicProductListItem[]; total: number }> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return { items: [], total: 0 };

  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, summary, main_image_path, main_image_alt, price, tags, sort_order, categories!inner(name, slug)",
      { count: "exact" },
    )
    .eq("user_id", ownerId)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (opts?.search) {
    const safeSearch = sanitizeSearchInput(opts.search);
    if (safeSearch) {
      query = query.or(`name.ilike.%${safeSearch}%,summary.ilike.%${safeSearch}%,tags.cs.{${safeSearch}}`);
    }
  }
  if (opts?.categorySlug) {
    query = query.eq("categories.slug", opts.categorySlug);
  }
  if (opts?.tag) {
    query = query.contains("tags", [opts.tag]);
  }

  const limit = opts?.limit ?? 24;
  const offset = opts?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error("[getVisibleProducts]", error.message);
    return { items: [], total: 0 };
  }

  const rows = (data ?? []) as unknown as {
    id: UUID;
    name: string;
    slug: string;
    summary: string | null;
    main_image_path: string | null;
    main_image_alt: string | null;
    price: number | null;
    tags: string[];
    sort_order: number;
    categories: { name: string; slug: string };
  }[];

  return {
    items: rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      summary: r.summary,
      main_image_path: r.main_image_path,
      main_image_alt: r.main_image_alt,
      price: r.price ?? null,
      tags: r.tags,
      sort_order: r.sort_order,
      category_name: r.categories?.name ?? "",
      category_slug: r.categories?.slug ?? "",
    })),
    total: count ?? 0,
  };
}

export interface PublicProductDetail {
  id: UUID;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  price: number | null;
  main_image_path: string | null;
  main_image_alt: string | null;
  gallery: { path: string; alt: string }[];
  tags: string[];
  category: { id: UUID; name: string; slug: string };
  spec_values: (ProductSpecValue & { field: CategorySpecField })[];
  documents: ProductDocument[];
}

function parseGallery(raw: unknown): { path: string; alt: string }[] {
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

export async function getProductBySlug(storeSlug: string, productSlug: string): Promise<PublicProductDetail | null> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return null;

  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", ownerId)
    .eq("slug", productSlug)
    .eq("is_visible", true)
    .single();
  if (!product) return null;

  const p = product as Product;

  // Parallelize category lookup, spec template + fields, and documents
  const [catRes, templateRes, docsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", p.category_id)
      .single(),
    supabase
      .from("category_spec_templates")
      .select("*, category_spec_fields(*)")
      .eq("category_id", p.category_id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", p.id)
      .order("sort_order"),
  ]);

  let specValues: (ProductSpecValue & { field: CategorySpecField })[] = [];
  const template = templateRes.data as unknown as { id: UUID; category_spec_fields?: CategorySpecField[] } | null;

  if (template) {
    const { data: values } = await supabase
      .from("product_spec_values")
      .select("*")
      .eq("product_id", p.id);

    const fields = template.category_spec_fields ?? [];
    const fieldMap = new Map<string, CategorySpecField>(fields.map((f) => [f.id, f]));

    specValues = (values ?? [])
      .map((v) => {
        const sv = v as ProductSpecValue;
        const field = fieldMap.get(sv.field_id);
        return field ? { ...sv, field } : null;
      })
      .filter(Boolean) as (ProductSpecValue & { field: CategorySpecField })[];
  }

  const category = catRes.data as { id: UUID; name: string; slug: string } | null;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary,
    description: p.description,
    price: p.price ?? null,
    main_image_path: p.main_image_path,
    main_image_alt: p.main_image_alt,
    gallery: parseGallery(p.gallery),
    tags: p.tags ?? [],
    category: {
      id: category?.id ?? p.category_id,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
    spec_values: specValues,
    documents: (docsRes.data ?? []) as ProductDocument[],
  };
}

/* ---------- Featured ---------- */

export async function getFeaturedCategories(storeSlug: string): Promise<PublicCategory[]> {
  return getVisibleCategories(storeSlug);
}

/**
 * Smart Featured Products:
 * 1. Ambil order_leads terbaru untuk toko ini.
 * 2. Parse items_summary untuk menghitung frekuensi produk.
 * 3. Prioritaskan produk yang paling sering dipesan.
 * 4. Fallback ke produk visible biasa jika belum ada leads.
 */
export async function getFeaturedProducts(storeSlug: string, limit = 6): Promise<PublicProductListItem[]> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return [];

  const supabase = createAdminClient();

  // 1. Ambil 100 leads terbaru
  const { data: leads } = await supabase
    .from("order_leads")
    .select("items_summary")
    .eq("store_slug", storeSlug)
    .order("created_at", { ascending: false })
    .limit(100);

  // 2. Parse items_summary dan hitung frekuensi nama produk
  const productFrequency = new Map<string, number>();

  if (leads && leads.length > 0) {
    for (const lead of leads as { items_summary: string }[]) {
      const summary = lead.items_summary;
      // Format: "2x Produk ABC, 1x Produk XYZ" atau "Produk ABC (2)"
      const matches = summary.matchAll(/\d+x\s+(.+?)(?:,|$)/g);
      for (const match of matches) {
        const name = match[1].trim();
        if (name) {
          productFrequency.set(name.toLowerCase(), (productFrequency.get(name.toLowerCase()) ?? 0) + 1);
        }
      }
    }
  }

  // 3. Ambil produk visible
  const result = await getVisibleProducts(storeSlug, { limit: limit * 3 }); // ambil lebih banyak untuk sorting
  const products = result.items;

  if (productFrequency.size === 0) {
    // Fallback: tidak ada leads, return biasa
    return products.slice(0, limit);
  }

  // 4. Sort berdasarkan frekuensi leads (descending), lalu sort_order
  const scored = products.map((p) => {
    const freq = productFrequency.get(p.name.toLowerCase()) ?? 0;
    return { ...p, _freq: freq };
  });

  scored.sort((a, b) => {
    if (b._freq !== a._freq) return b._freq - a._freq;
    return a.sort_order - b.sort_order;
  });

  return scored.slice(0, limit).map(({ _freq, ...p }) => p);
}
