import { z } from "zod";

export const galleryItemSchema = z.object({
  path: z.string().min(1, "Path gambar wajib"),
  alt: z.string().max(200).optional().or(z.literal("")),
});

export const productDocumentSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label dokumen wajib").max(160),
  file_path: z.string().min(1, "File wajib"),
  file_size: z.number().int().nonnegative().optional().nullable(),
  mime_type: z.string().max(120).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib").max(180),
  slug: z
    .string()
    .min(1, "Slug wajib")
    .max(180)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  category_id: z.string().min(1, "Kategori wajib dipilih"),
  summary: z.string().max(300).optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  main_image_path: z.string().optional().nullable(),
  main_image_alt: z.string().max(200).optional().or(z.literal("")),
  gallery: z.array(galleryItemSchema).default([]),
  tags: z.array(z.string()).default([]),
  price: z.coerce.number().nonnegative().optional().nullable(),
  is_visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
  documents: z.array(productDocumentSchema).default([]),
  spec_values: z.record(z.string(), z.string()).default({}),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductDocumentFormValues = z.infer<typeof productDocumentSchema>;
export type GalleryItemFormValues = z.infer<typeof galleryItemSchema>;