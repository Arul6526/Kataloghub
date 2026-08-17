import { z } from "zod";
import { FIELD_TYPES } from "@/lib/validators/category";

export const specFieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label wajib").max(120),
  field_key: z
    .string()
    .min(1, "Key wajib")
    .max(80)
    .regex(/^[a-z0-9_]+$/, "Key hanya boleh huruf kecil, angka, dan garis bawah"),
  field_type: z.enum(FIELD_TYPES),
  options: z.array(z.string()).default([]),
  unit: z.string().max(40).optional().or(z.literal("")),
  is_required: z.boolean().default(false),
  is_filterable: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

export const specTemplateSchema = z.object({
  is_active: z.boolean().default(true),
  fields: z.array(specFieldSchema).default([]),
});

export type SpecFieldFormValues = z.infer<typeof specFieldSchema>;
export type SpecTemplateFormValues = z.infer<typeof specTemplateSchema>;

/**
 * Validasi endpoint: label & key unik di dalam template, key format snake_case,
 * options wajib untuk tipe select (minimal 1 pilihan).
 */
export function validateTemplateFields(fields: SpecFieldFormValues[]) {
  const errors: Record<number, Partial<Record<keyof SpecFieldFormValues, string>>> = {};
  const seenKeys = new Map<string, number>();
  const seenLabels = new Map<string, number>();

  fields.forEach((f, idx) => {
    const fieldErrors: Partial<Record<keyof SpecFieldFormValues, string>> = {};

    if (seenKeys.has(f.field_key)) {
      fieldErrors.field_key = `Key "${f.field_key}" sudah dipakai`;
    } else {
      seenKeys.set(f.field_key, idx);
    }

    if (seenLabels.has(f.label)) {
      fieldErrors.label = `Label "${f.label}" sudah dipakai`;
    } else {
      seenLabels.set(f.label, idx);
    }

    if (f.field_type === "select" && (!f.options || f.options.length === 0)) {
      fieldErrors.options = "Tipe select wajib memiliki minimal 1 pilihan";
    }

    if (Object.keys(fieldErrors).length > 0) errors[idx] = fieldErrors;
  });

  return errors;
}