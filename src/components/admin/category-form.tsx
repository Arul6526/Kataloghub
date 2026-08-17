"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { Loader2, Save } from "lucide-react";
import { slugify } from "@/lib/utils";
import Link from "next/link";
import {
  createCategoryAction,
  updateCategoryAction,
  type ActionResult,
} from "@/lib/actions/category-actions";
import type { Category } from "@/lib/db/types";

interface CategoryFormProps {
  mode: "create" | "edit";
  category?: Category;
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(mode === "edit");
  const [name, setName] = React.useState(category?.name ?? "");
  const [slug, setSlug] = React.useState(category?.slug ?? "");
  const [description, setDescription] = React.useState(category?.description ?? "");
  const [imageAlt, setImageAlt] = React.useState(category?.image_alt ?? "");
  const [image, setImage] = React.useState<File | null>(null);
  const [replaceImage, setReplaceImage] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(category?.is_visible ?? false);
  const [sortOrder, setSortOrder] = React.useState(category?.sort_order ?? 0);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("image_alt", imageAlt);
    formData.set("is_visible", String(isVisible));
    formData.set("sort_order", String(sortOrder));
    if (image) formData.set("image", image);
    if (mode === "edit") formData.set("replace_image", String(replaceImage));

    const res: ActionResult =
      mode === "create"
        ? await createCategoryAction(formData)
        : await updateCategoryAction(category!.id, formData);

    setLoading(false);

    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan", description: res.error });
      return;
    }
    toast({ variant: "success", title: mode === "create" ? "Kategori dibuat" : "Perubahan disimpan" });
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama kategori" htmlFor="name" required>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            disabled={loading}
            placeholder="mis. Valve Industri"
          />
        </Field>
        <Field
          label="Slug"
          htmlFor="slug"
          required
          hint="URL: /katalog/[slug]. Hanya huruf kecil, angka, dan tanda hubung."
        >
          <Input
            id="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            disabled={loading}
            placeholder="valve-industri"
          />
        </Field>
      </div>

      <Field label="Deskripsi singkat" htmlFor="description" hint="Maks. 600 karakter. Tampil di halaman kategori publik.">
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          maxLength={600}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={mode === "edit" ? "Ganti gambar/ikon (opsional)" : "Gambar/ikon (opsional)"}
          htmlFor="image"
          hint="PNG/JPG/WebP, maks ±2MB. Rekomendasi rasio kotak 1:1."
        >
          <Input
            id="image"
            type="file"
            accept="image/*"
            disabled={loading}
            onChange={(e) => {
              setImage(e.target.files?.[0] ?? null);
              setReplaceImage(true);
            }}
          />
        </Field>
        <Field label="Alt teks gambar" htmlFor="image_alt" hint="Untuk aksesibilitas.">
          <Input
            id="image_alt"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            disabled={loading}
            placeholder="mis. Ikon katup industri"
          />
        </Field>
      </div>

      {mode === "edit" && category?.image_path && !replaceImage && (
        <p className="text-xs text-muted-foreground">
          Gambar saat ini akan dipertahankan bila tidak ada file baru dipilih.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="is_visible">Tampilkan kategori</Label>
            <p className="text-xs text-muted-foreground">
              Bila nonaktif, kategori tidak tampil di situs publik.
            </p>
          </div>
          <Switch
            id="is_visible"
            checked={isVisible}
            onCheckedChange={setIsVisible}
            disabled={loading}
          />
        </div>
        <Field label="Urutan tampil" htmlFor="sort_order" hint="Angka kecil tampil lebih dulu.">
          <Input
            id="sort_order"
            type="number"
            min={0}
            max={9999}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            disabled={loading}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Buat Kategori" : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/categories">Batal</Link>
        </Button>
      </div>
    </form>
  );
}