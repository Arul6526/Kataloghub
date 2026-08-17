/**
 * Types untuk tabel-tabel katalog.
 * Tipe ini merefleksikan struktur di supabase/migrations/.
 *
 * Catatan: kode "Database" belum di-generate dari Supabase (mode local-first).
 * Setiap tabel di sini saling konsisten dengan kolom SQL, sehingga dapat
 * diganti dengan tipe hasil `supabase gen types --local` kapan saja.
 */

export type UUID = string;
export type ISODate = string;

export type FieldType = "text" | "number" | "boolean" | "select";
export type LandingSectionKey =
  | "hero"
  | "about"
  | "advantages"
  | "featured_categories"
  | "featured_products"
  | "testimonials"
  | "cta";

export interface Profile {
  id: UUID;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  role?: "owner" | "superadmin";
  created_at: ISODate;
  updated_at: ISODate;
}

export type SubscriptionPlan = "free_trial" | "starter" | "pro" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "expired"
  | "suspended"
  | "pending_approval";

export interface Subscription {
  id: UUID;
  user_id: UUID;
  plan_name: SubscriptionPlan;
  status: SubscriptionStatus;
  max_products: number;
  max_landing_pages: number;
  starts_at: ISODate;
  expires_at: ISODate | null;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SubscriptionPlanConfig {
  id: UUID;
  slug: string;
  name: string;
  price: number;
  price_label: string | null;
  billing_period: string;
  duration_days: number;
  max_products: number;
  max_landing_pages: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SubscriptionPayment {
  id: UUID;
  user_id: UUID;
  plan_slug: string;
  amount: number;
  payment_method: string;
  order_id?: string | null;
  payment_gateway?: string | null;
  checkout_url?: string | null;
  reference_note: string | null;
  status: "completed" | "pending" | "rejected" | "failed" | "expired";
  raw_response?: any;
  processed_by: UUID | null;
  created_at: ISODate;
}

export interface PlatformBankAccount {
  id: UUID;
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_active: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface PlatformSetting {
  key: string;
  value: string;
  updated_at: ISODate;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  image_alt: string | null;
  is_visible: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CategorySpecTemplate {
  id: UUID;
  category_id: UUID;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CategorySpecField {
  id: UUID;
  template_id: UUID;
  label: string;
  field_key: string;
  field_type: FieldType;
  options: string[];
  unit: string | null;
  is_required: boolean;
  is_filterable: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface GalleryItem {
  path: string;
  alt: string;
}

export interface Product {
  id: UUID;
  category_id: UUID;
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  price: number | null;
  main_image_path: string | null;
  main_image_alt: string | null;
  gallery: GalleryItem[];
  tags: string[];
  is_visible: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export type SpecValue =
  | { value_text: string }
  | { value_number: number }
  | { value_boolean: boolean }
  | { value_select: string };

export interface ProductSpecValue {
  id: UUID;
  product_id: UUID;
  field_id: UUID;
  value_text: string | null;
  value_number: number | null;
  value_boolean: boolean | null;
  value_select: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface ProductDocument {
  id: UUID;
  product_id: UUID;
  label: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface LandingSection {
  id: UUID;
  section_key: LandingSectionKey;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  config: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SiteSettings {
  id: number;
  user_id: UUID;
  brand_name: string;
  brand_tagline: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  whatsapp_number: string | null;
  whatsapp_template: string;
  seo_title: string | null;
  seo_description: string | null;
  store_slug: string | null;
  show_prices: boolean;
  brand_logo_path: string | null;
  catalog_announcement_title: string | null;
  catalog_announcement_message: string | null;
  catalog_announcement_enabled: boolean;
  catalog_announcement_image_path: string | null;
  social_instagram?: string | null;
  social_tiktok?: string | null;
  social_shopee?: string | null;
  category_slug?: string | null;
  language?: string | null;
  updated_at: ISODate;
}

/* ----------------------------------------------------------------- *
 * Variants public-ready (strikethrough NULL image) untuk query publik
 * ----------------------------------------------------------------- */

export interface ProductWithRelations extends Product {
  category?: Pick<Category, "id" | "name" | "slug">;
  spec_values?: (ProductSpecValue & {
    field?: CategorySpecField;
  })[];
  documents?: ProductDocument[];
}

export interface CustomLandingPage {
  id: UUID;
  title: string;
  slug: string;
  html_source: string;
  css_source: string;
  js_source: string;
  is_active: boolean;
  product_ids: UUID[];
  meta_title: string | null;
  meta_description: string | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CategoryWithStats extends Category {
  product_count?: number;
  template?: CategorySpecTemplate & { fields?: CategorySpecField[] };
}

export interface OrderLead {
  id: UUID;
  user_id: UUID | null;
  store_slug: string;
  customer_name: string | null;
  items_summary: string;
  total_price: number;
  created_at: ISODate;
}