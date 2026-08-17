import { z } from "zod";

export const FIELD_TYPES = ["text", "number", "boolean", "select"] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").max(120),
  slug: z
    .string()
    .min(1, "Slug wajib diisi")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().max(600).optional().or(z.literal("")),
  image_path: z.string().optional().nullable(),
  image_alt: z.string().max(200).optional().or(z.literal("")),
  is_visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;