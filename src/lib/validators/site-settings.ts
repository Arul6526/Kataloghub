import { z } from "zod";

const PHONE = /^\d{6,15}$/;

export const siteSettingsSchema = z.object({
  brand_name: z.string().min(1, "Nama brand wajib").max(120),
  brand_tagline: z.string().max(200).optional().or(z.literal("")),
  contact_email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().max(40).optional().or(z.literal("")),
  contact_address: z.string().max(400).optional().or(z.literal("")),
  whatsapp_number: z
    .string()
    .min(1, "Nomor WhatsApp wajib agar CTA berfungsi")
    .max(20)
    .regex(PHONE, "Nomor WhatsApp harus berupa digit internasional tanpa '+' atau spasi (contoh: 62812xxxxxxxx)"),
  whatsapp_template: z
    .string()
    .min(1, "Template pesan wajib")
    .max(600)
    .refine(
      (t) => !t.includes("[nama produk]") || t.includes("[nama produk]"),
      "Token [nama produk] opsional — gunakan persis seperti itu bila ingin",
    ),
  seo_title: z.string().max(180).optional().or(z.literal("")),
  seo_description: z.string().max(400).optional().or(z.literal("")),
  show_prices: z.boolean().default(false),
  catalog_announcement_title: z.string().max(120).optional().or(z.literal("")),
  catalog_announcement_message: z.string().max(600).optional().or(z.literal("")),
  catalog_announcement_enabled: z.boolean().default(true),
  social_instagram: z.string().max(300).optional().or(z.literal("")),
  social_tiktok: z.string().max(300).optional().or(z.literal("")),
  social_shopee: z.string().max(300).optional().or(z.literal("")),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>;