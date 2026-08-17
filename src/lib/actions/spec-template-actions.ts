"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type {
  Category,
  CategorySpecField,
  CategorySpecTemplate,
  UUID,
} from "@/lib/db/types";
import type { SpecFieldFormValues } from "@/lib/validators/spec-field";
import { validateTemplateFields } from "@/lib/validators/spec-field";

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface CategoryWithTemplate {
  category: Category;
  template: CategorySpecTemplate | null;
  fields: CategorySpecField[];
}

/**
 * Ambil daftar kategori dengan status template + jumlah field.
 */
export async function fetchCategoriesWithTemplate() {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  const ids = (categories as Category[]).map((c) => c.id);
  if (ids.length === 0) return [];

  const { data: templates } = await supabase
    .from("category_spec_templates")
    .select("id, category_id, is_active")
    .in("category_id", ids);

  const templateMap = new Map<string, { id: string; is_active: boolean }>();
  for (const t of (templates ?? []) as { id: string; category_id: string; is_active: boolean }[]) {
    templateMap.set(t.category_id, { id: t.id, is_active: t.is_active });
  }

  const templateIds = Array.from(templateMap.values()).map((t) => t.id);
  const fieldCounts: Record<string, number> = {};
  if (templateIds.length > 0) {
    const { data: fields } = await supabase
      .from("category_spec_fields")
      .select("template_id");
    if (fields) {
      for (const f of fields as { template_id: string }[]) {
        fieldCounts[f.template_id] = (fieldCounts[f.template_id] ?? 0) + 1;
      }
    }
  }

  return (categories as Category[]).map((c) => {
    const tpl = templateMap.get(c.id);
    return {
      ...c,
      template_id: tpl?.id ?? null,
      template_active: tpl?.is_active ?? false,
      field_count: tpl ? (fieldCounts[tpl.id] ?? 0) : 0,
    };
  });
}

/**
 * Ambil detail kategori + template + ordered fields.
 */
export async function fetchCategoryTemplate(categoryId: string): Promise<CategoryWithTemplate> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();
  const { data: category, error: catErr } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .single();
  if (catErr || !category) throw new Error("Kategori tidak ditemukan");

  const { data: template } = await supabase
    .from("category_spec_templates")
    .select("*")
    .eq("category_id", categoryId)
    .maybeSingle();

  let fields: CategorySpecField[] = [];
  if (template) {
    const { data: fieldsData } = await supabase
      .from("category_spec_fields")
      .select("*")
      .eq("template_id", template.id)
      .order("sort_order", { ascending: true });
    fields = (fieldsData ?? []) as CategorySpecField[];
  }

  return {
    category: category as Category,
    template: (template as CategorySpecTemplate) ?? null,
    fields,
  };
}

/**
 * Simpan/update template spesifikasi: upsert template + sinkronisasi fields
 * (insert baru / update existing / delete yang hilang).
 */
export async function saveTemplateAction(
  categoryId: string,
  isActive: boolean,
  fields: SpecFieldFormValues[],
): Promise<ActionResult> {
  await requireAdmin();

  // Validasi integrity fields
  const errors = validateTemplateFields(fields);
  if (Object.keys(errors).length > 0) {
    const firstErr = Object.values(errors)[0];
    const msg = firstErr ? Object.values(firstErr)[0] : "Field tidak valid";
    return { ok: false, error: msg ?? "Field tidak valid" };
  }

  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Pastikan kategori milik user ini
  const { data: cat } = await supabase.from("categories").select("id").eq("id", categoryId).eq("user_id", userId).single();
  if (!cat) return { ok: false, error: "Kategori tidak ditemukan atau akses ditolak" };

  // Upsert template
  const { data: template, error: tplErr } = await supabase
    .from("category_spec_templates")
    .upsert(
      { category_id: categoryId, is_active: isActive },
      { onConflict: "category_id" },
    )
    .select("*")
    .single();
  if (tplErr || !template) return { ok: false, error: tplErr?.message ?? "Gagal menyimpan template" };

  const templateId = (template as CategorySpecTemplate).id;

  // Ambil field existing untuk diff
  const { data: existingFields } = await supabase
    .from("category_spec_fields")
    .select("id, field_key")
    .eq("template_id", templateId);
  const existingMap = new Map<string, string>();
  for (const f of (existingFields ?? []) as { id: string; field_key: string }[]) {
    existingMap.set(f.field_key, f.id);
  }

  const submittedKeys = new Set<string>();
  const toInsert: SpecFieldFormValues[] = [];
  const toUpdate: { id: UUID; field: SpecFieldFormValues }[] = [];

  fields.forEach((f, idx) => {
    submittedKeys.add(f.field_key);
    if (f.id) {
      toUpdate.push({ id: f.id, field: { ...f, sort_order: idx } });
    } else if (existingMap.has(f.field_key)) {
      // Reuse ID existing bila key sama (id tidak dikirim dari client)
      toUpdate.push({ id: existingMap.get(f.field_key)!, field: { ...f, sort_order: idx } });
    } else {
      toInsert.push({ ...f, sort_order: idx });
    }
  });

  // Delete yang tidak ada di submission
  const toDelete = Array.from(existingMap.entries())
    .filter(([key]) => !submittedKeys.has(key))
    .map(([, id]) => id);
  if (toDelete.length > 0) {
    const { error: delErr } = await supabase
      .from("category_spec_fields")
      .delete()
      .in("id", toDelete);
    if (delErr) return { ok: false, error: `Gagal menghapus field lama: ${delErr.message}` };
  }

  // Insert baru
  if (toInsert.length > 0) {
    const { error: insErr } = await supabase.from("category_spec_fields").insert(
      toInsert.map((f) => ({
        template_id: templateId,
        label: f.label,
        field_key: f.field_key,
        field_type: f.field_type,
        options: f.options,
        unit: f.unit || null,
        is_required: f.is_required,
        is_filterable: f.is_filterable,
        sort_order: f.sort_order,
      })),
    );
    if (insErr) return { ok: false, error: `Gagal menambah field baru: ${insErr.message}` };
  }

  // Update existing
  for (const { id, field } of toUpdate) {
    const { error: updErr } = await supabase
      .from("category_spec_fields")
      .update({
        label: field.label,
        field_key: field.field_key,
        field_type: field.field_type,
        options: field.options,
        unit: field.unit || null,
        is_required: field.is_required,
        is_filterable: field.is_filterable,
        sort_order: field.sort_order,
      })
      .eq("id", id);
    if (updErr) return { ok: false, error: `Gagal update field "${field.label}": ${updErr.message}` };
  }

  revalidatePath("/admin/spec-templates");
  revalidatePath(`/admin/spec-templates?category=${categoryId}`);
  return { ok: true };
}

export async function toggleTemplateActiveAction(
  categoryId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const { userId } = await requireAdmin();
  const supabase = await createClient();

  // Pastikan kategori milik user ini
  const { data: cat } = await supabase.from("categories").select("id").eq("id", categoryId).eq("user_id", userId).single();
  if (!cat) return { ok: false, error: "Kategori tidak ditemukan atau akses ditolak" };
  const { error } = await supabase
    .from("category_spec_templates")
    .update({ is_active: isActive })
    .eq("category_id", categoryId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/spec-templates");
  return { ok: true };
}