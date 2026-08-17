import { createAdminClient } from "@/lib/supabase/server";
import { logAuditEvent } from "@/lib/security/audit";
import { z } from "zod";

export const PRODUCT_AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "create_product",
      description:
        "Mengusulkan produk baru. Produk selalu dibuat tersembunyi sampai user menampilkannya.",
      parameters: {
        type: "object",
        required: ["name", "category_id", "price"],
        properties: {
          name: { type: "string" },
          category_id: { type: "string", description: "UUID kategori milik user" },
          summary: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          tags: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_product",
      description: "Mengusulkan perubahan data produk milik user.",
      parameters: {
        type: "object",
        required: ["product_id"],
        properties: {
          product_id: { type: "string" },
          name: { type: "string" },
          summary: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          tags: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
];

const createProductSchema = z.object({
  name: z.string().trim().min(1).max(180),
  category_id: z.string().uuid(),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(20_000).optional(),
  price: z.number().nonnegative(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

const updateProductSchema = z
  .object({
    product_id: z.string().uuid(),
    name: z.string().trim().min(1).max(180).optional(),
    summary: z.string().trim().max(300).optional(),
    description: z.string().trim().max(20_000).optional(),
    price: z.number().nonnegative().optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .refine((value) => Object.keys(value).length > 1, "Tidak ada perubahan produk.");

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 180) || `produk-${Date.now()}`
  );
}

export async function executeProductTool(
  userId: string,
  name: string,
  rawArguments: Record<string, unknown>,
) {
  const db = createAdminClient();
  if (name === "create_product") {
    const input = createProductSchema.parse(rawArguments);
    const { data: category } = await db
      .from("categories")
      .select("id")
      .eq("id", input.category_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!category) throw new Error("Kategori tidak ditemukan atau bukan milik toko Anda.");
    const { data: subscription } = await db
      .from("subscriptions")
      .select("max_products, status, expires_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (subscription?.status === "suspended") throw new Error("Akun toko sedang ditangguhkan.");
    if (subscription?.expires_at && new Date(subscription.expires_at) < new Date())
      throw new Error("Langganan toko sudah berakhir.");
    const { count } = await db
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (subscription?.max_products !== undefined && (count || 0) >= subscription.max_products)
      throw new Error("Kuota produk toko sudah habis.");
    const baseSlug = slugify(input.name);
    const { data: sameSlug } = await db
      .from("products")
      .select("id")
      .eq("user_id", userId)
      .eq("slug", baseSlug)
      .maybeSingle();
    const slug = sameSlug ? `${baseSlug}-${Date.now().toString(36)}`.slice(0, 180) : baseSlug;
    const { data, error } = await db
      .from("products")
      .insert({
        user_id: userId,
        category_id: input.category_id,
        name: input.name,
        slug,
        summary: input.summary || null,
        description: input.description || null,
        price: input.price,
        tags: input.tags || [],
        is_visible: false,
        sort_order: 0,
      })
      .select("id, name, slug")
      .single();
    if (error) throw new Error(error.message);
    await logAuditEvent({
      actionType: "ai_create_product",
      targetType: "product",
      targetId: data.id,
      details: { name: input.name, mode: "ai_confirmed" },
    });
    return { message: `Produk ${input.name} berhasil dibuat sebagai draft.`, product: data };
  }

  if (name === "update_product") {
    const input = updateProductSchema.parse(rawArguments);
    const { data: existing } = await db
      .from("products")
      .select("id, name")
      .eq("id", input.product_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!existing) throw new Error("Produk tidak ditemukan atau bukan milik toko Anda.");
    const { product_id, ...changes } = input;
    const { error } = await db
      .from("products")
      .update(changes)
      .eq("id", product_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    await logAuditEvent({
      actionType: "ai_update_product",
      targetType: "product",
      targetId: product_id,
      details: { changes: Object.keys(changes), mode: "ai_confirmed" },
    });
    return { message: `Produk ${existing.name} berhasil diperbarui.` };
  }

  throw new Error("Tool produk tidak dikenal.");
}
