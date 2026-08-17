import { z } from "zod";

export const LANDING_SECTION_KEYS = [
  "hero",
  "about",
  "advantages",
  "featured_categories",
  "featured_products",
  "testimonials",
  "cta",
] as const;

export const landingSectionSchema = z.object({
  section_key: z.enum(LANDING_SECTION_KEYS),
  heading: z.string().max(180).optional().or(z.literal("")),
  subheading: z.string().max(280).optional().or(z.literal("")),
  body: z.string().optional().or(z.literal("")),
  config: z.record(z.string(), z.unknown()).default({}),
  is_visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

export type LandingSectionFormValues = z.infer<typeof landingSectionSchema>;

export const advantageItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(300).optional().or(z.literal("")),
  icon: z.enum([
    "shield",
    "tool",
    "truck",
    "medal",
    "badge-check",
    "gauge",
    "sparkles",
    "users",
  ]).optional(),
});

export const testimonialItemSchema = z.object({
  author: z.string().min(1).max(120),
  role: z.string().max(120).optional().or(z.literal("")),
  quote: z.string().min(1).max(400),
  project: z.string().max(120).optional().or(z.literal("")),
});

export type AdvantageItem = z.infer<typeof advantageItemSchema>;
export type TestimonialItem = z.infer<typeof testimonialItemSchema>;