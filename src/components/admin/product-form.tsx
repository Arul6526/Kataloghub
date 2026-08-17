"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  FileText,
  ImagePlus,
  AlertCircle,
} from "lucide-react";
import { slugify, cn } from "@/lib/utils";
import {
  saveProductAction,
  uploadProductImageAction,
  uploadProductDocumentAction,
  removeProductAssetAction,
  type SaveProductInput,
  type ProductDetail,
} from "@/lib/actions/product-actions";
import type { Category, CategorySpecField } from "@/lib/db/types";
import { publicUrl } from "@/lib/storage-url";

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: ProductDetail;
  categories: { id: string; name: string }[];
  fieldsByCategory: Record<
    string,
    { template_id: string; is_active: boolean; fields: CategorySpecField[] }
  >;
}

export function ProductForm({ mode, initial, categories, fieldsByCategory }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [categoryId, setCategoryId] = React.useState(initial?.product.category_id ?? categories[0]?.id ?? "");
  const [name, setName] = React.useState(initial?.product.name ?? "");
  const [slug, setSlug] = React.useState(initial?.product.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [price, setPrice] = React.useState<number | null>(initial?.product.price ?? null);
  const [summary, setSummary] = React.useState(initial?.product.summary ?? "");
  const [description, setDescription] = React.useState(initial?.product.description ?? "");
  const [mainImagePath, setMainImagePath] = React.useState<string | null>(
    initial?.product.main_image_path ?? null,
  );
  const [mainImageAlt, setMainImageAlt] = React.useState(initial?.product.main_image_alt ?? "");
  const [gallery, setGallery] = React.useState<{ path: string; alt: string }[]>(
    initial?.product.gallery ?? [],
  );
  const [tags, setTags] = React.useState<string[]>(initial?.product.tags ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [isVisible, setIsVisible] = React.useState(initial?.product.is_visible ?? false);
  const [sortOrder, setSortOrder] = React.useState(initial?.product.sort_order ?? 0);
  const [documents, setDocuments] = React.useState<
    {
      id?: string;
      label: string;
      file_path: string;
      file_size?: number | null;
      mime_type?: string | null;
      sort_order: number;
      _delete?: boolean;
    }[]
  >((initial?.documents ?? []).map((d) => ({ ...d, _delete: false })));
  const [specValues, setSpecValues] = React.useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (initial?.spec_values) {
      for (const v of initial.spec_values) {
        if (v.value_text !== null) map[v.field_id] = v.value_text;
        else if (v.value_number !== null) map[v.field_id] = String(v.value_number);
        else if (v.value_boolean !== null) map[v.field_id] = String(v.value_boolean);
        else if (v.value_select !== null) map[v.field_id] = v.value_select;
      }
    }
    return map;
  });

  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadingGallery, setUploadingGallery] = React.useState(false);
  const [uploadingDoc, setUploadingDoc] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);

  const currentFields = fieldsByCategory[categoryId]?.fields ?? [];
  const templateActive = fieldsByCategory[categoryId]?.is_active ?? false;

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleMainImageUpload(file: File | undefined) {
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadProductImageAction(file);
      if (!res.ok) throw new Error(res.error);
      setMainImagePath(res.path);
      toast({ variant: "success", title: "Foto utama terupload" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Upload gagal",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      for (const file of Array.from(files)) {
        const res = await uploadProductImageAction(file);
        if (!res.ok) throw new Error(res.error);
        setGallery((prev) => [...prev, { path: res.path, alt: "" }]);
      }
      toast({ variant: "success", title: `${files.length} gambar ditambahkan` });
    } catch (err) {
      toast({
        variant: "error",
        title: "Upload galeri gagal",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setUploadingGallery(false);
    }
  }

  function removeGalleryImage(idx: number) {
    setGallery((prev) => {
      const item = prev[idx];
      // If removing the image that's currently the main image, clear it
      if (item?.path && mainImagePath && item.path === mainImagePath) {
        setMainImagePath(null);
      }
      if (item?.path) removeProductAssetAction("product-images", item.path);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function setGalleryImageAsMain(idx: number) {
    const img = gallery[idx];
    if (!img) return;
    setMainImagePath(img.path);
    toast({ variant: "success", title: "Gambar utama diperbarui" });
  }

  function handleGalleryDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleGalleryDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleGalleryDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    setGallery((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function handleGalleryDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  async function handleDocUpload(file: File | undefined) {
    if (!file) return;
    setUploadingDoc(true);
    try {
      const res = await uploadProductDocumentAction(file);
      if (!res.ok) throw new Error(res.error);
      setDocuments((prev) => [
        ...prev,
        {
          label: file.name.replace(/\.[^.]+$/, ""),
          file_path: res.path,
          file_size: res.size,
          mime_type: res.mime,
          sort_order: prev.length,
          _delete: false,
        },
      ]);
      toast({ variant: "success", title: "Dokumen terupload" });
    } catch (err) {
      toast({
        variant: "error",
        title: "Upload dokumen gagal",
        description: err instanceof Error ? err.message : "",
      });
    } finally {
      setUploadingDoc(false);
    }
  }

  function removeDocument(idx: number) {
    setDocuments((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, _delete: true } : d)),
    );
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  const canPublish = Boolean(mainImagePath) && (currentFields.every((f) => !f.is_required || specValues[f.id]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) {
      toast({ variant: "error", title: "Kategori wajib dipilih" });
      return;
    }
    setSaving(true);
    const input: SaveProductInput = {
      id: initial?.product.id,
      category_id: categoryId,
      name,
      slug,
      summary,
      description,
      price,
      main_image_path: mainImagePath,
      main_image_alt: mainImageAlt,
      gallery,
      tags,
      is_visible: isVisible,
      sort_order: sortOrder,
      documents: documents.filter((d) => !d._delete),
      spec_values: specValues,
    };
    const res = await saveProductAction(input);
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan", description: res.error });
      return;
    }
    toast({ variant: "success", title: mode === "create" ? "Produk dibuat" : "Perubahan disimpan" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section: Dasar */}
      <FormSection
        title="Data Dasar"
        description="Informasi utama produk dan kategori."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori" required>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={saving || categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Urutan tampil" hint="Angka kecil tampil lebih dulu">
            <Input
              type="number"
              min={0}
              max={9999}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              disabled={saving}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama produk" required>
            <Input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={saving}
            />
          </Field>
          <Field label="Slug" required hint="URL: /produk/[slug]">
            <Input
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              disabled={saving}
              className="font-mono"
            />
          </Field>
        </div>
        <Field label="Ringkasan" hint="Maks 300 karakter. Tampil di kartu produk.">
          <Textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            disabled={saving}
            maxLength={300}
          />
        </Field>
        <Field label="Deskripsi lengkap" hint="Mendukung teks bebas. Tampil di halaman detail produk.">
          <Textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
          />
        </Field>
        <Field label="Harga (Rp)" hint="Kosongkan jika produk ini tidak memiliki harga.">
          <Input
            type="number"
            min={0}
            value={price ?? ""}
            onChange={(e) => setPrice(e.target.value === "" ? null : Number(e.target.value))}
            disabled={saving}
            placeholder="0"
            className="font-mono"
          />
        </Field>
      </FormSection>

      {/* Section: Media */}
      <FormSection title="Media" description="Foto utama wajib sebelum produk dapat ditampilkan.">
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <Label className="text-sm font-medium">Foto utama</Label>
            <p className="mt-1 text-xs text-muted-foreground">Rekomendasi 4:3 atau 1:1.</p>
            <div className="mt-2 aspect-square rounded-lg border-2 border-dashed bg-muted/30">
              {mainImagePath ? (
                <div className="relative h-full w-full">
                  <img
                    src={publicUrl("product-images", mainImagePath) ?? ""}
                    alt={mainImageAlt || name}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      removeProductAssetAction("product-images", mainImagePath);
                      setMainImagePath(null);
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  {uploadingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                  Upload foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage || saving}
                    onChange={(e) => handleMainImageUpload(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <Field label="Alt teks foto utama" hint="Untuk aksesibilitas & SEO.">
              <Input
                value={mainImageAlt}
                onChange={(e) => setMainImageAlt(e.target.value)}
                disabled={saving}
                placeholder="mis. Pom sentrifugal seri X-200"
              />
            </Field>
            <div>
              <Label className="text-sm font-medium">Galeri</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Seret gambar untuk mengubah urutan. Hover → klik <strong>★ Utama</strong> untuk menjadikan gambar utama.
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {gallery.map((g, idx) => {
                  const isMain = mainImagePath === g.path;
                  const isDragging = dragIdx === idx;
                  const isDragTarget = dragOverIdx === idx && dragIdx !== idx;
                  return (
                    <div
                      key={g.path}
                      draggable
                      onDragStart={() => handleGalleryDragStart(idx)}
                      onDragOver={(e) => handleGalleryDragOver(e, idx)}
                      onDrop={(e) => handleGalleryDrop(e, idx)}
                      onDragEnd={handleGalleryDragEnd}
                      className={`group relative aspect-square overflow-hidden rounded-md border bg-muted cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? "opacity-40 scale-95" : ""
                      } ${
                        isDragTarget ? "ring-2 ring-primary ring-offset-1" : ""
                      } ${
                        isMain ? "ring-2 ring-green-500 ring-offset-1" : ""
                      }`}
                    >
                      <img
                        src={publicUrl("product-images", g.path) ?? ""}
                        alt={g.alt || name}
                        className="h-full w-full object-cover pointer-events-none"
                      />
                      {/* Main image badge */}
                      {isMain && (
                        <div className="absolute left-0.5 top-0.5 rounded bg-green-600 px-1 py-0.5 text-[9px] font-semibold text-white leading-none">
                          Utama
                        </div>
                      )}
                      {/* Set as main button */}
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => setGalleryImageAsMain(idx)}
                          title="Jadikan gambar utama"
                          className="absolute left-0.5 top-0.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100 leading-none"
                        >
                          ★ Utama
                        </button>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {/* Alt text input */}
                      <input
                        value={g.alt}
                        onChange={(e) =>
                          setGallery((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, alt: e.target.value } : x)),
                          )
                        }
                        placeholder="alt"
                        className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[10px] text-white outline-none"
                        disabled={saving}
                      />
                    </div>
                  );
                })}
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:text-foreground">
                  {uploadingGallery ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingGallery || saving}
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section: Spesifikasi teknis (dinamis dari template kategori) */}
      {currentFields.length > 0 && (
        <FormSection
          title="Spesifikasi Teknis"
          description={
            templateActive
              ? "Mengikuti template kategori. Field bertanda * wajib diisi."
              : "Template nonaktif — field di bawah tetap disimpan, tapi tidak divalidasi."
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {currentFields.map((field) => (
              <SpecFieldInput
                key={field.id}
                field={field}
                value={specValues[field.id] ?? ""}
                onChange={(v) => setSpecValues((prev) => ({ ...prev, [field.id]: v }))}
                disabled={saving}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* Section: Dokumen */}
      <FormSection title="Dokumen Unduhan" description="File katalog, manual, datasheet, dll.">
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
            {uploadingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload dokumen
            <input
              type="file"
              className="hidden"
              disabled={uploadingDoc || saving}
              onChange={(e) => handleDocUpload(e.target.files?.[0])}
            />
          </label>
          <div className="space-y-2">
            {documents.map((doc, idx) =>
              doc._delete ? null : (
                <div
                  key={doc.id ?? idx}
                  className="flex items-center gap-3 rounded-md border bg-card p-3"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={doc.label}
                    onChange={(e) =>
                      setDocuments((prev) =>
                        prev.map((d, i) => (i === idx ? { ...d, label: e.target.value } : d)),
                      )
                    }
                    disabled={saving}
                    className="flex-1"
                    placeholder="Label dokumen"
                  />
                  <span className="text-xs text-muted-foreground">
                    {doc.mime_type || "file"}
                  </span>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeDocument(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>
      </FormSection>

      {/* Section: Tags & Status */}
      <FormSection title="Tag & Status" description="Tag dipakai sebagai filter publik.">
        <Field label="Tag" hint="Tekan Enter untuk menambah.">
          <div className="flex flex-wrap gap-1.5 rounded-md border p-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder={tags.length === 0 ? "ketik tag..." : ""}
              disabled={saving}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3 shadow-sm">
          <div className="space-y-0.5">
            <Label htmlFor="is_visible">Tampilkan produk</Label>
            <p className="text-xs text-muted-foreground">
              Hanya bisa aktif bila foto utama & field wajib sudah lengkap.
            </p>
          </div>
          <Switch
            id="is_visible"
            checked={isVisible}
            onCheckedChange={setIsVisible}
            disabled={saving}
          />
        </div>
        {isVisible && !canPublish && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              Produk belum bisa ditampilkan. Pastikan foto utama sudah ada dan semua
              field spesifikasi wajib sudah diisi.
            </div>
          </div>
        )}
      </FormSection>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Buat Produk" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/products">Batal</Link>
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 space-y-0.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SpecFieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: CategorySpecField;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const label = (
    <>
      {field.label}
      {field.is_required ? <span className="text-destructive"> *</span> : null}
      {field.unit ? <span className="ml-1 text-xs text-muted-foreground">({field.unit})</span> : null}
    </>
  );

  if (field.field_type === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
        <Label className="text-sm">{label}</Label>
        <Switch checked={value === "true"} onCheckedChange={(v) => onChange(String(v))} disabled={disabled} />
      </div>
    );
  }

  if (field.field_type === "select") {
    return (
      <Field label={label}>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih..." />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    );
  }

  return (
    <Field label={label}>
      <Input
        type={field.field_type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </Field>
  );
}