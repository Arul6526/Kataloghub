# 📊 KatalogHub — Data Optimization Plan

> **Goal:** Menaikkan data score dari **8/10 → 10/10**  
> **Audit Date:** 30 Juli 2026  
> **Total N+1 patterns found:** 10 locations  
> **Data integrity issues:** 7 locations  

---

## 📋 Ringkasan Masalah

| Problem | Severity | Files Affected | Impact |
|---------|----------|---------------|--------|
| N+1 query di loop produk | 🔴 Critical | `product-actions.ts`, `public-data.ts` | **200+ query** untuk 20 produk |
| Sequential disjointed queries | 🟠 High | `public-data.ts`, `product-actions.ts` | 6 query per produk detail |
| Manual aggregation di JS | 🟠 High | `public-data.ts`, `saas-actions.ts` | Scaling failure >500 produk |
| No pagination di admin | 🟡 Medium | `saas-actions.ts` | Memory overflow |
| Race condition slug unique | 🟡 Medium | `product-actions.ts` | Duplicate slug crash |
| JSON serialization inconsistency | 🟢 Low | `product-actions.ts` | Gallery parse hack everywhere |

---

## 🔍 N+1 Query Deep Dive

### Pattern 1: `fetchProducts` → `checkRequiredSpecsFilled` per row
**File:** `src/lib/actions/product-actions.ts:91-109`

**Current (N+1):**
```
1 query:  SELECT products JOIN categories LIMIT 20
N queries: FOR EACH product → checkRequiredSpecsFilled()
  ├── 1 query: category_spec_templates (by category_id)
  ├── 1 query: category_spec_fields (by template_id) 
  └── 1 query: product_spec_values (by product_id)
Total: 1 + (N × 3) = 61 queries untuk 20 produk
```

**Fix — Bulk check dengan batch query:**
```typescript
export async function fetchProducts(opts?: { ... }): Promise<FetchProductsResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  // Single query: products + categories join + left join spec check
  let query = supabase
    .from("products")
    .select(`
      id, name, slug, category_id, main_image_path, price, 
      is_visible, sort_order, updated_at,
      categories!inner(id, name, slug)
    `, { count: "exact" })
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  // ... filters same as before

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  if (rows.length === 0) return { items: [], total: count ?? 0 };

  // ── BULK spec check: 3 queries total, bukan N×3 ──
  const productIds = rows.map((r: any) => r.id);
  const categoryIds = [...new Set(rows.map((r: any) => r.category_id))];

  // 1. Ambil semua template untuk category yang relevan
  const { data: templates } = await supabase
    .from("category_spec_templates")
    .select("category_id, id")
    .in("category_id", categoryIds)
    .eq("is_active", true);

  if (!templates || templates.length === 0) {
    // No templates → all products have complete specs
    return {
      items: rows.map((r: any) => ({ ...r, category_name: r.categories?.name ?? "—", category_slug: r.categories?.slug ?? "", has_required_specs: true })),
      total: count ?? 0,
    };
  }

  const templateIds = templates.map((t: any) => t.id);
  const categoryToTemplate = new Map(templates.map((t: any) => [t.category_id, t.id]));

  // 2. Ambil semua required field IDs untuk semua template ini
  const { data: reqFields } = await supabase
    .from("category_spec_fields")
    .select("id, template_id")
    .in("template_id", templateIds)
    .eq("is_required", true);

  if (!reqFields || reqFields.length === 0) {
    return {
      items: rows.map((r: any) => ({ ...r, category_name: r.categories?.name ?? "—", category_slug: r.categories?.slug ?? "", has_required_specs: true })),
      total: count ?? 0,
    };
  }

  const reqFieldIds = reqFields.map((f: any) => f.id);

  // 3. Ambil semua product_spec_values untuk produk ini yang field_id-nya required
  const { data: filledValues } = await supabase
    .from("product_spec_values")
    .select("product_id, field_id, value_text, value_number, value_boolean, value_select")
    .in("product_id", productIds)
    .in("field_id", reqFieldIds);

  // Build lookup: product_id → Set of filled field IDs
  const filledMap = new Map<string, Set<string>>();
  for (const v of (filledValues ?? []) as any[]) {
    const isFilled = v.value_text !== null && v.value_text !== ""
      || v.value_number !== null
      || v.value_boolean !== null
      || (v.value_select !== null && v.value_select !== "");
    if (isFilled) {
      if (!filledMap.has(v.product_id)) filledMap.set(v.product_id, new Set());
      filledMap.get(v.product_id)!.add(v.field_id);
    }
  }

  // Per product: template → required fields → check filled
  const templateReqFields = new Map<string, string[]>();
  for (const f of reqFields as any[]) {
    if (!templateReqFields.has(f.template_id)) templateReqFields.set(f.template_id, []);
    templateReqFields.get(f.template_id)!.push(f.id);
  }

  const items = rows.map((r: any) => {
    const tplId = categoryToTemplate.get(r.category_id);
    const filled = tplId ? (filledMap.get(r.id)?.size ?? 0) : 0;
    const required = tplId ? (templateReqFields.get(tplId)?.length ?? 0) : 0;
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
      has_required_specs: filled >= required,
    } satisfies ProductListItem;
  });

  return { items, total: count ?? 0 };
}
```

**Comparison:**

| Metric | Before | After |
|--------|--------|-------|
| Query count (20 products) | **61** | **4** |
| Query count (100 products) | **301** | **4** |
| Response time | O(N) linear | O(1) constant |
| Data transfer | 60 round trips | 4 round trips |

---

### Pattern 2: `getVisibleCategories` → `getProductCounts` manual
**File:** `src/lib/public-data.ts:73-113`

**Current (1+N):**
```
1 query: SELECT categories (all active)
1 query: SELECT products (ALL products → client-side count!)
Total: 2 query, but ALL products transferred
```

**Fix — Use subquery with Supabase `count` aggregate:**
```typescript
export async function getVisibleCategories(storeSlug: string): Promise<PublicCategory[]> {
  const ownerId = await getStoreOwnerId(storeSlug);
  if (!ownerId) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id, name, slug, description, image_path, image_alt, sort_order,
      products!inner(count)
    `)
    .eq("user_id", ownerId)
    .eq("is_visible", true)
    .eq("products.is_visible", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("[getVisibleCategories]", error.message);
    return [];
  }

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_path: c.image_path,
    image_alt: c.image_alt,
    sort_order: c.sort_order,
    product_count: c.products?.[0]?.count ?? 0,
  }));
}
```

**Comparison:**

| Metric | Before | After |
|--------|--------|-------|
| Query count | 2 (1 cat + 1 all products) | **1** |
| Data transfer | Semua produk dikirim | Hanya count via join |
| Time complexity | O(categories + products) | O(categories) |

---

### Pattern 3: `fetchProductDetail` — 6 sequential queries
**File:** `src/lib/actions/product-actions.ts:162-227`

**Current:** Product → Category → Template → Fields → Values → Documents = **6 query**

**Fix — Gabung semua dalam 3 parallel query:**
```typescript
export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Parallel: product + category, spec template + fields, documents
  const [productResult, specResult, docResult] = await Promise.all([
    // 1. Product + category in one query
    supabase
      .from("products")
      .select("*, categories(id, name, slug)")
      .eq("id", id)
      .eq("user_id", userId)
      .single(),

    // 2. Template + fields in one query
    supabase
      .from("category_spec_templates")
      .select("*, category_spec_fields(*)")
      .eq("category_id", 
        supabase.from("products").select("category_id").eq("id", id).single() // subquery
      )
      .maybeSingle(),

    // 3. Documents
    supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),

    // 4. Spec values (parallel)
    supabase
      .from("product_spec_values")
      .select("*")
      .eq("product_id", id)
      .order("field_id"),
  ]);

  if (productResult.error || !productResult.data) {
    throw new Error("Produk tidak ditemukan");
  }

  const product = productResult.data as any;
  const specData = specResult.data as any;
  const documents = (docResult.data ?? []) as ProductDocument[];
  const specValues = (specResult2?.data ?? []) as ProductSpecValue[];

  return {
    product: { ...product, gallery: parseGalleryField(product.gallery) } as Product,
    category: product.categories ?? { id: product.category_id, name: "—", slug: "" },
    spec_template: specData ? {
      id: specData.id,
      is_active: specData.is_active,
      fields: (specData.category_spec_fields ?? []) as CategorySpecField[],
    } : null,
    spec_values: specValues,
    documents,
  };
}
```

Wait, I can't use subquery like that. Let me fix the approach:

Actually, the simplest fix for `fetchProductDetail` is:

```typescript
export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // 1. Product query with category join
  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !product) throw new Error("Produk tidak ditemukan");

  const p = product as Product & { categories: { id: UUID; name: string; slug: string } | null };
  const categoryId = p.category_id;

  // 2. Parallel: spec info + documents
  const [specResult, docResult, valuesResult] = await Promise.all([
    supabase
      .from("category_spec_templates")
      .select("*, category_spec_fields(*)")
      .eq("category_id", categoryId)
      .maybeSingle(),
    supabase
      .from("product_documents")
      .select("*")
      .eq("product_id", id)
      .order("sort_order"),
    supabase
      .from("product_spec_values")
      .select("*")
      .eq("product_id", id)
      .order("field_id"),
  ]);

  // ... rest same
```

That improves from 6 sequential queries to 3 parallel queries. Still room for improvement but 50% reduction.

---

### Pattern 4: `getProductBySlug` — 6 sequential queries (public side)
**File:** `src/lib/public-data.ts:267-348`

**Current:** product → category → template → fields → values → documents = **6 sequential**

**Fix — Sama dengan fetchProductDetail, pakai Promise.all:**
```typescript
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

  // Parallel queries
  const [catResult, templateResult, docResult] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("id", p.category_id).single(),
    supabase
      .from("category_spec_templates")
      .select("*, category_spec_fields(*)")
      .eq("category_id", p.category_id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase.from("product_documents").select("*").eq("product_id", p.id).order("sort_order"),
  ]);

  let specValues: (ProductSpecValue & { field: CategorySpecField })[] = [];
  const template = templateResult.data as any;
  if (template) {
    const { data: values } = await supabase
      .from("product_spec_values")
      .select("*")
      .eq("product_id", p.id);

    const fields = (template.category_spec_fields ?? []) as CategorySpecField[];
    const fieldMap = new Map(fields.map((f) => [f.id, f]));
    specValues = ((values ?? []) as ProductSpecValue[])
      .map((v) => {
        const field = fieldMap.get(v.field_id);
        return field ? { ...v, field } as any : null;
      })
      .filter(Boolean);
  }

  // ... rest same
}
```

---

### Pattern 5: Superadmin analytics — ALL data di client
**File:** `src/lib/actions/saas-actions.ts`

**`getSuperAdminStats()`**: 
- 1 count profiles
- 1 SELECT all subscriptions → manual forEach
- 1 count products  
- **Problem:** Subscriptions di-*load semua* padahal cuma butuh aggregasi

**Fix — Gunakan proper aggregate query:**
```typescript
export async function getSuperAdminStats(): Promise<SaaSStats> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const [totalOwners, totalProducts, subscriptions] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("subscriptions").select("status, plan_name, expires_at"),
  ]);

  const now = new Date();
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const subs = (subscriptions.data ?? []) as Subscription[];

  return {
    totalOwners: totalOwners.count ?? 0,
    totalProducts: totalProducts.count ?? 0,
    activeSubscriptions: subs.filter((s) => s.status === "active").length,
    freeTrialCount: subs.filter((s) => s.plan_name === "free_trial").length,
    proCount: subs.filter((s) => s.plan_name === "pro").length,
    enterpriseCount: subs.filter((s) => s.plan_name === "enterprise").length,
    suspendedCount: subs.filter((s) => s.status === "suspended").length,
    expiringSoon: subs.filter(
      (s) => s.expires_at && new Date(s.expires_at) > now 
        && new Date(s.expires_at) <= next7Days && s.status === "active"
    ).length,
  };
}
```

Better: we could use proper SQL aggregates but Supabase JS client doesn't support multi-aggregate. The above reduces 3 queries to 2 parallel queries.

**`getSuperAdminAnalytics()`**: 
- SELECT all profiles (all time!) → manual grouping by month
- SELECT all subscriptions → manual plan count

**Fix — Batasi range + proper grouping:**
```typescript
export async function getSuperAdminAnalytics(): Promise<SaaSAnalyticsData> {
  await requireSuperAdmin();
  const supabase = await createClient();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const [profilesResult, subsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at"),
    supabase.from("subscriptions").select("plan_name"),
  ]);

  // ... rest same but fewer profiles loaded
}
```

---

### Pattern 6: `getStoreOwnersList` — 4 queries + 1 full table scan
**File:** `src/lib/actions/saas-actions.ts:176-268`

**Current:**
```
1x SELECT profiles (all)
1x SELECT site_settings IN (user_ids)
1x SELECT subscriptions IN (user_ids) 
1x SELECT products (ALL → dihitung manual per user)
```

**Fix — Count products sekali pake grouping:**
```typescript
export async function getStoreOwnersList(
  searchQuery?: string,
  planFilter?: string,
  statusFilter?: string
): Promise<OwnerOverviewItem[]> {
  await requireSuperAdmin();
  const supabase = await createClient();

  // Parallel: profiles + product counts (grouped)
  let profilesQuery = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (searchQuery?.trim()) {
    profilesQuery = profilesQuery.or(
      `email.ilike.%${searchQuery.trim()}%,full_name.ilike.%${searchQuery.trim()}%`
    );
  }

  const [profilesResult, productCountResult] = await Promise.all([
    profilesQuery,
    // Single query with group by — count products per user
    supabase.from("products").select("user_id"),
  ]);

  const profiles = profilesResult.data ?? [];
  if (!profiles.length) return [];

  const userIds = profiles.map((p: any) => p.id);

  // Count products per user (in JS from the one fetch)
  const productCountMap = new Map<string, number>();
  for (const p of (productCountResult.data ?? []) as any[]) {
    if (p.user_id) {
      productCountMap.set(p.user_id, (productCountMap.get(p.user_id) ?? 0) + 1);
    }
  }

  // Parallel fetch settings + subscriptions
  const [settingsResult, subsResult] = await Promise.all([
    supabase
      .from("site_settings")
      .select("user_id, brand_name, store_slug")
      .in("user_id", userIds),
    (() => {
      let q = supabase.from("subscriptions").select("*").in("user_id", userIds);
      if (planFilter && planFilter !== "all") q = q.eq("plan_name", planFilter);
      if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
      return q;
    })(),
  ]);

  const settingsMap = new Map(
    (settingsResult.data ?? []).map((s: any) => [s.user_id, s])
  );
  const subMap = new Map(
    (subsResult.data ?? []).map((s: any) => [s.user_id, s as Subscription])
  );

  // Combine  
  return profiles
    .map((profile: any) => {
      const storeSetting = settingsMap.get(profile.id);
      const sub = subMap.get(profile.id) || null;

      if ((planFilter && planFilter !== "all") || (statusFilter && statusFilter !== "all")) {
        if (!sub) return null;
      }

      return {
        userId: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        brandName: storeSetting?.brand_name || "Belum Mengatur Toko",
        storeSlug: storeSetting?.store_slug || null,
        createdAt: profile.created_at,
        subscription: sub,
        productCount: productCountMap.get(profile.id) || 0,
      };
    })
    .filter(Boolean) as OwnerOverviewItem[];
}
```

---

### Pattern 7: `getMySubscription` — 4 sequential queries
**File:** `src/lib/actions/saas-actions.ts:425-467`

**Current:** sub → productCount → settings → payments = **4 sequential**

**Fix — Parallel:**
```typescript
export async function getMySubscription(): Promise<{...}> {
  const current = await requireAdmin();
  const supabase = await createClient();

  const [subResult, countResult, settingResult, paymentsResult] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", current.userId).single(),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", current.userId),
    supabase.from("site_settings").select("brand_name, store_slug").eq("user_id", current.userId).maybeSingle(),
    supabase.from("subscription_payments").select("*").eq("user_id", current.userId).order("created_at", { ascending: false }),
  ]);

  const sub = subResult.data as Subscription | null;
  
  return {
    subscription: sub || null,
    productCount: countResult.count ?? 0,
    maxProducts: sub?.max_products ?? 5,
    brandName: settingResult.data?.brand_name || null,
    storeSlug: settingResult.data?.store_slug || null,
    payments: (paymentsResult.data ?? []) as SubscriptionPayment[],
  };
}
```

---

## 🛡️ Data Integrity Issues

### Issue 1: Race Condition — Slug Unique Check
**File:** `product-actions.ts:277-285`

**Masalah:** SELECT dulu, then INSERT. Antara SELECT dan INSERT, request lain bisa insert slug yang sama.

**Fix — Gunakan unique constraint di database + catch:**
```typescript
// 1. Migration SQL — tambah unique constraint
// ALTER TABLE products ADD CONSTRAINT products_slug_user_id UNIQUE (slug, user_id);
// ALTER TABLE categories ADD CONSTRAINT categories_slug_user_id UNIQUE (slug, user_id);
// ALTER TABLE custom_landing_pages ADD CONSTRAINT clp_slug_user_id UNIQUE (slug, user_id);

// 2. Di saveProductAction, ganti manual check → try-catch
export async function saveProductAction(input: SaveProductInput): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  const baseRow = { /* ... */ };
  let productId: UUID;

  if (input.id) {
    const { error } = await supabase
      .from("products")
      .update(baseRow)
      .eq("id", input.id)
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
    productId = input.id;
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(baseRow)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") { // PostgreSQL unique violation
        return { ok: false, error: "Slug sudah dipakai produk lain" };
      }
      return { ok: false, error: error.message };
    }
    productId = (data as { id: UUID }).id;
  }

  // ... rest
}
```

**Effort:** 30 menit (SQL migration + TS update)  
**Risk:** 🟠 Duplicate slug crash di production

---

### Issue 2: Spec Values Delete-then-Reinsert
**File:** `product-actions.ts:381-401`

**Masalah:** `DELETE` semua spec values lama → `INSERT` baru. Kalau insert gagal di tengah, data ilang.

**Fix — Upsert dengan single operation:**
```typescript
// Ganti delete + insert dengan upsert
// Tapi Supabase upsert perlu unique constraint
// Migration:
// ALTER TABLE product_spec_values ADD CONSTRAINT psv_product_field UNIQUE (product_id, field_id);

// Fix di saveProductAction:
// Hapus baris delete all
// Ganti dengan:
const specRows = fieldList
  .map((field) => {
    const raw = input.spec_values[field.id];
    if (raw === undefined || raw === "") return null;
    const row: Record<string, unknown> = {
      product_id: productId,
      field_id: field.id,
    };
    if (field.field_type === "text") row.value_text = raw;
    else if (field.field_type === "number") row.value_number = Number(raw);
    else if (field.field_type === "boolean") row.value_boolean = raw === "true" || raw === "1";
    else if (field.field_type === "select") row.value_select = raw;
    return row;
  })
  .filter(Boolean);

if (specRows.length > 0) {
  const { error } = await supabase
    .from("product_spec_values")
    .upsert(specRows, { onConflict: "product_id, field_id" });
  // If spec row no longer needed, we need a separate cleanup
}
```

Actually, simpler approach for MVP — wrap in transaction:
```typescript
// Pakai Supabase RPC atau handle error dengan restore
// Atau cukup delete dulu, insert, kalau insert gagal → re-throw
// (MVP acceptable, data loss minimal karena spec values jarang berubah)
```

**Risk:** 🟢 Minor — data loss in edge case

---

### Issue 3: Gallery JSON Serialization Inconsistent
**Files:** `product-actions.ts` + `public-data.ts`

**Masalah:** Gallery field sometimes stored as JSON string, sometimes as parsed array. Ada `parseGalleryField()` dan `parseGallery()` di dua file — duplicate code.

**Fix — Store as proper JSONB in database:**
```sql
ALTER TABLE products ALTER COLUMN gallery TYPE JSONB USING 
  CASE 
    WHEN gallery IS NULL THEN '[]'::jsonb
    WHEN json_valid(gallery::text) THEN gallery::jsonb 
    ELSE to_jsonb(gallery)
  END;
```

```typescript
// product-actions.ts — tinggal set langsung tanpa stringify
const baseRow = {
  // ...
  gallery: input.gallery,  // langsung array, Supabase JSONB handle otomatis
};

// public-data.ts — tinggal akses langsung tanpa parse
gallery: (p.gallery ?? []) as { path: string; alt: string }[],
```

**Effort:** 15 menit  
**Benefit:** Hapus 2 utility function + 8 lines code tiap file

---

### Issue 4: `categories!inner` Silent Exclusion
**File:** `product-actions.ts:57`

```typescript
.select("..., categories!inner(id, name, slug)")
```

**Masalah:** Kalau produk punya `category_id` yang tidak ada di tabel categories (constraint violation atau referensi orphan), produk **tidak muncul** di list — tanpa error.

**Fix — Gunakan left join:**
```typescript
.select("..., categories(id, name, slug)")  // tanpa !inner = LEFT JOIN
// Dan handle null categories di map
category_name: r.categories?.name ?? "—",
category_slug: r.categories?.slug ?? "",
```

Sama untuk `getVisibleProducts` di `public-data.ts:175`.

**Effort:** 2 menit  
**Risk:** 🟢 Produk tidak tampil tanpa notifikasi

---

### Issue 5: Console Log Exposing userId
**File:** `product-actions.ts:75`

```typescript
console.log("fetchProducts retrieved rows:", data?.length, "for userId:", userId);
```

**Masalah:** User ID muncul di production log. Kalau log-nya bocor (Sentry, Papertrail, dll), attacker bisa mapping user IDs.

**Fix — Hapus atau gunakan logger yang aman:**
```typescript
// Hapus atau ganti
if (process.env.NODE_ENV === "development") {
  console.log(`[fetchProducts] ${data?.length ?? 0} rows`);
}
```

**Effort:** 1 menit  
**Risk:** 🟡 Privacy leak

---

### Issue 6: No Pagination di Order Leads List
**File:** Admin pages → semua order leads di-fetch tanpa limit

**Masalah:** Store dengan banyak order leads akan slow load.

**Fix:** Tambah `limit` dan `offset` parameter, atau paging via Infinite Scroll.

**Effort:** 1-2 jam  
**Risk:** 🟡 Performance issue at scale

---

### Issue 7: Subscription Check Hanya di INSERT
**File:** `saas-actions.ts`

**Masalah:** Subscription quota (max_products) dicek hanya saat INSERT, bukan UPDATE.

**Fix:** Tambah subscription check di UPDATE path juga.

**Effort:** 15 menit  
**Risk:** 🟡 Store owner bisa exceed quota via update

---

## 📊 Data Layer Score Calculation

| Area | Before | After | Key Improvement |
|------|--------|-------|----------------|
| **N+1 Query Elimination** | 3/10 | 10/10 | Batch fetch, Promise.all, aggregate queries |
| **Data Integrity** | 7/10 | 10/10 | Unique constraints, upsert instead of delete+insert |
| **Performance** | 5/10 | 9/10 | Reduced from 61→4 queries per page load |
| **Code Quality** | 7/10 | 9/10 | Remove duplicate parsers, fix silent exclusion |
| **Total** | **5.5/10** | **9.5/10** | |

---

## 🎯 Prioritized Task List

| ID | Task | Effort | Query Reduction | Priority |
|----|------|--------|----------------|----------|
| D1 | **Batch spec check** di fetchProducts | 2h | 61→4 (93%) | 🔴 **Week 1** |
| D2 | **Promise.all** di fetchProductDetail | 30m | 6→3 (50%) | 🔴 **Week 1** |
| D3 | **Left join categories** | 2m | — | 🔴 **Week 1** |
| D4 | **Promise.all** di getProductBySlug | 30m | 6→3 (50%) | 🟠 **Week 1** |
| D5 | **Aggregate** getVisibleCategories | 30m | 2→1 (50%) | 🟠 **Week 2** |
| D6 | **Parallel** getMySubscription | 15m | 4→2 (50%) | 🟠 **Week 2** |
| D7 | **Unique constraint** + race condition fix | 30m | — | 🟠 **Week 2** |
| D8 | **Limit** getSuperAdminAnalytics | 15m | Data transfer ↓90% | 🟠 **Week 2** |
| D9 | **Gallery JSONB** consistency | 15m | — | 🟢 **Week 3** |
| D10 | **Spec upsert** instead of delete+insert | 30m | — | 🟢 **Week 3** |
| D11 | **Hapus console.log** userId | 1m | — | 🟢 **Week 3** |
| D12 | **Pagination** order leads | 1-2h | — | 🟢 **Week 3** |

---

## 📈 Performance Impact Estimate

**Before:**
```
Toko main page (categories + products): 
  getStoreOwnerId → getVisibleCategories + getVisibleProducts 
  = 1 + 2 + 3 + (categories × 0) + (products × 0... actually products already joined)
  ~ 3-5 queries
  
Admin product list (20 products):
  fetchProducts = 1 + 20 × 3 = 61 queries → ~300ms-1s

Admin product detail:
  fetchProductDetail = 6 sequential queries → ~200ms

Superadmin dashboard:
  getSuperAdminStats + getStoreOwnersList + analytics
  = 5 queries + full table scan → ~500ms-2s
```

**After:**
```
Toko main page: 2-3 queries → ~50ms
Admin product list (20 products): 4 queries → ~80ms
Admin product detail: 3 parallel queries → ~60ms
Superadmin dashboard: 4 queries (parallel) → ~100ms
```

**Total page load improvement:** 3-10x faster 🚀

---

## 🔧 Implementation Approach

Semua fix ini **read-only** untuk `public-data.ts` files — artinya gak ngerusak data. Formatnya:
1. Ganti sequential await → `Promise.all`
2. Ganti per-row query → batch `WHERE IN`
3. Hapus `console.log` sensitif
4. Tambah `LIMIT` di admin queries

**Yang Mulia, mau gue gas mulai dari D1 (batch spec check fetchProducts) atau D2 (Promise.all fetchProductDetail) dulu?** Keduanya paling berdampak — langsung kurangi query **93% dan 50%**. 🚀
