"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Upload,
  X,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import {
  toggleLandingSectionAction,
  reorderLandingSectionsAction,
  saveLandingSectionAction,
} from "@/lib/actions/landing-actions";
import type { LandingSectionKey } from "@/lib/db/types";
import { publicUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";

export interface LandingSectionFull {
  id: string;
  section_key: LandingSectionKey;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  config: Record<string, unknown>;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface LandingSectionsClientProps {
  sections: LandingSectionFull[];
  sectionLabels: Record<LandingSectionKey, { label: string; description: string }>;
  categoryOptions: { id: string; name: string; slug: string; image_path: string | null }[];
  productOptions: { id: string; name: string; slug: string; main_image_path: string | null }[];
}

export function LandingSectionsClient({
  sections: initialSections,
  sectionLabels,
  categoryOptions,
  productOptions,
}: LandingSectionsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [sections, setSections] = React.useState(initialSections);
  const [expandedKey, setExpandedKey] = React.useState<LandingSectionKey | null>(null);
  const [toggling, setToggling] = React.useState<string | null>(null);
  const [savingOrder, setSavingOrder] = React.useState(false);

  async function handleToggle(sectionKey: LandingSectionKey, visible: boolean) {
    setToggling(sectionKey);
    const res = await toggleLandingSectionAction(sectionKey, visible);
    setToggling(null);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal", description: res.error });
      return;
    }
    setSections((prev) =>
      prev.map((s) => (s.section_key === sectionKey ? { ...s, is_visible: visible } : s)),
    );
    toast({ variant: "success", title: visible ? "Section ditampilkan" : "Section disembunyikan" });
  }

  function moveSection(idx: number, dir: "up" | "down") {
    setSections((prev) => {
      const next = [...prev];
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function saveOrder() {
    setSavingOrder(true);
    const res = await reorderLandingSectionsAction(sections.map((s) => s.section_key));
    setSavingOrder(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan urutan", description: res.error });
      return;
    }
    toast({ variant: "success", title: "Urutan disimpan" });
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => (
        <SectionCard
          key={section.section_key}
          section={section}
          label={sectionLabels[section.section_key]}
          expanded={expandedKey === section.section_key}
          onToggleExpand={() =>
            setExpandedKey((prev) => (prev === section.section_key ? null : section.section_key))
          }
          onToggleVisible={(v) => handleToggle(section.section_key, v)}
          toggling={toggling === section.section_key}
          onMoveUp={() => moveSection(idx, "up")}
          onMoveDown={() => moveSection(idx, "down")}
          isFirst={idx === 0}
          isLast={idx === sections.length - 1}
          categoryOptions={categoryOptions}
          productOptions={productOptions}
        />
      ))}

      <div className="flex items-center gap-2 pt-2">
        <Button onClick={saveOrder} disabled={savingOrder} variant="outline">
          {savingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Simpan Urutan Baru
        </Button>
      </div>
    </div>
  );
}

interface SectionCardProps {
  section: LandingSectionFull;
  label: { label: string; description: string };
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleVisible: (v: boolean) => void;
  toggling: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  categoryOptions: { id: string; name: string; slug: string; image_path: string | null }[];
  productOptions: { id: string; name: string; slug: string; main_image_path: string | null }[];
}

function SectionCard({
  section,
  label,
  expanded,
  onToggleExpand,
  onToggleVisible,
  toggling,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  categoryOptions,
  productOptions,
}: SectionCardProps) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b p-3">
        <div className="flex flex-col gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Naik urutan"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Turun urutan"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1 cursor-pointer" onClick={onToggleExpand}>
          <h3 className="text-sm font-semibold">{label.label}</h3>
          <p className="text-xs text-muted-foreground">{label.description}</p>
        </div>
        <Badge variant={section.is_visible ? "success" : "secondary"}>
          {section.is_visible ? (
            <>
              <Eye className="h-3 w-3" /> Tampil
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3" /> Sembunyi
            </>
          )}
        </Badge>
        <Switch
          checked={section.is_visible}
          onCheckedChange={onToggleVisible}
          disabled={toggling}
          aria-label="Toggle tampil section"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleExpand}
          aria-label={expanded ? "Tutup" : "Buka"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="p-4">
          <SectionEditor
            section={section}
            categoryOptions={categoryOptions}
            productOptions={productOptions}
          />
        </div>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  categoryOptions,
  productOptions,
}: {
  section: LandingSectionFull;
  categoryOptions: { id: string; name: string; slug: string; image_path: string | null }[];
  productOptions: { id: string; name: string; slug: string; main_image_path: string | null }[];
}) {
  switch (section.section_key) {
    case "hero":
      return <HeroEditor section={section} />;
    case "about":
      return <AboutEditor section={section} />;
    case "advantages":
      return <AdvantagesEditor section={section} />;
    case "featured_categories":
      return (
        <FeaturedCategoriesEditor
          section={section}
          categoryOptions={categoryOptions}
        />
      );
    case "featured_products":
      return (
        <FeaturedProductsEditor
          section={section}
          productOptions={productOptions}
        />
      );
    case "testimonials":
      return <TestimonialsEditor section={section} />;
    case "cta":
      return <CtaEditor section={section} />;
    default:
      return null;
  }
}

/* ============================
 * Generic save wrapper
 * ============================ */
function useSaveSection(sectionKey: LandingSectionKey) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const save = async (payload: {
    heading?: string;
    subheading?: string;
    body?: string;
    config?: Record<string, unknown>;
  }) => {
    setSaving(true);
    const res = await saveLandingSectionAction(sectionKey, payload);
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan", description: res.error });
      return false;
    }
    toast({ variant: "success", title: "Section disimpan" });
    router.refresh();
    return true;
  };

  return { saving, save };
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <Button type="submit" disabled={saving}>
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Simpan Section
    </Button>
  );
}

/* ============================
 * Hero editor
 * ============================ */
function HeroEditor({ section }: { section: LandingSectionFull }) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [subheading, setSubheading] = React.useState(section.subheading ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(
    (section.config.cta_label as string) ?? "Lihat Katalog",
  );
  const [ctaHref, setCtaHref] = React.useState(
    (section.config.cta_href as string) ?? "/katalog",
  );
  const [imagePath, setImagePath] = React.useState<string | null>(
    (section.config.image_path as string) ?? null,
  );
  const [uploading, setUploading] = React.useState(false);

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/admin/landing/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImagePath(data.path);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({
          heading,
          subheading,
          config: { image_path: imagePath, cta_label: ctaLabel, cta_href: ctaHref },
        });
      }}
      className="space-y-4"
    >
      <Field label="Judul">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Subjudul">
        <Input value={subheading} onChange={(e) => setSubheading(e.target.value)} disabled={saving} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label CTA" hint="Teks tombol.">
          <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} disabled={saving} />
        </Field>
        <Field label="Link CTA" hint="URL tujuan tombol.">
          <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} disabled={saving} placeholder="/katalog" />
        </Field>
      </div>
      <div>
        <Label className="text-sm font-medium">Gambar latar (opsional)</Label>
        <div className="mt-2 flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload gambar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || saving}
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
          </label>
          {imagePath && (
            <>
              <img
                src={publicUrl("landing-media", imagePath) ?? ""}
                alt="hero"
                className="h-12 w-20 rounded object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => setImagePath(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <SaveButton saving={saving} />
    </form>
  );
}

/* ============================
 * About editor
 * ============================ */
function AboutEditor({ section }: { section: LandingSectionFull }) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [body, setBody] = React.useState(section.body ?? "");
  const [imagePath, setImagePath] = React.useState<string | null>(
    (section.config.image_path as string) ?? null,
  );
  const [uploading, setUploading] = React.useState(false);

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/admin/landing/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImagePath(data.path);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, body, config: { image_path: imagePath } });
      }}
      className="space-y-4"
    >
      <Field label="Judul">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Deskripsi">
        <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} disabled={saving} />
      </Field>
      <div>
        <Label className="text-sm font-medium">Gambar (opsional)</Label>
        <div className="mt-2 flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || saving}
              onChange={(e) => uploadImage(e.target.files?.[0])}
            />
          </label>
          {imagePath && (
            <>
              <img
                src={publicUrl("landing-media", imagePath) ?? ""}
                alt="about"
                className="h-12 w-20 rounded object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => setImagePath(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <SaveButton saving={saving} />
    </form>
  );
}

/* ============================
 * Advantages editor
 * ============================ */
const ADVANTAGE_ICONS = [
  "shield",
  "tool",
  "truck",
  "medal",
  "badge-check",
  "gauge",
  "sparkles",
  "users",
];

function AdvantagesEditor({ section }: { section: LandingSectionFull }) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [items, setItems] = React.useState<
    { title: string; description: string; icon: string }[]
  >(
    (section.config.items as { title: string; description: string; icon: string }[]) ?? [
      { title: "", description: "", icon: "shield" },
    ],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, config: { items } });
      }}
      className="space-y-4"
    >
      <Field label="Judul section">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 rounded-md border p-3">
            <select
              value={item.icon}
              onChange={(e) =>
                setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, icon: e.target.value } : x)))
              }
              className="rounded-md border bg-background px-2 py-1 text-xs"
            >
              {ADVANTAGE_ICONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <Input
              placeholder="Judul keunggulan"
              value={item.title}
              onChange={(e) =>
                setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
              }
              disabled={saving}
            />
            <Input
              placeholder="Deskripsi singkat (opsional)"
              value={item.description}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)),
                )
              }
              disabled={saving}
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setItems((prev) => [...prev, { title: "", description: "", icon: "shield" }])}
        disabled={saving}
      >
        <Plus className="h-4 w-4" />
        Tambah Item
      </Button>
      <div>
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

/* ============================
 * Featured categories editor
 * ============================ */
function FeaturedCategoriesEditor({
  section,
  categoryOptions,
}: {
  section: LandingSectionFull;
  categoryOptions: { id: string; name: string; slug: string; image_path: string | null }[];
}) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [selectedIds, setSelectedIds] = React.useState<string[]>(
    (section.config.category_ids as string[]) ?? [],
  );

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, config: { category_ids: selectedIds } });
      }}
      className="space-y-4"
    >
      <Field label="Judul section">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Pilih kategori unggulan" hint="Pilih beberapa. Urutan akan mengikuti urutan centang.">
        {categoryOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada kategori.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {categoryOptions.map((c) => (
              <label
                key={c.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                  selectedIds.includes(c.id) ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                )}
              >
                <Checkbox
                  checked={selectedIds.includes(c.id)}
                  onCheckedChange={() => toggle(c.id)}
                />
                {c.image_path ? (
                  <img
                    src={publicUrl("category-media", c.image_path) ?? ""}
                    alt={c.name}
                    className="h-9 w-9 rounded object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-muted" />
                )}
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Field>
      <SaveButton saving={saving} />
    </form>
  );
}

/* ============================
 * Featured products editor
 * ============================ */
function FeaturedProductsEditor({
  section,
  productOptions,
}: {
  section: LandingSectionFull;
  productOptions: { id: string; name: string; slug: string; main_image_path: string | null }[];
}) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [selectedIds, setSelectedIds] = React.useState<string[]>(
    (section.config.product_ids as string[]) ?? [],
  );

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, config: { product_ids: selectedIds } });
      }}
      className="space-y-4"
    >
      <Field label="Judul section">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Pilih produk unggulan" hint="Hanya produk yang sudah visible & memiliki foto utama yang muncul.">
        {productOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada produk yang visible.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {productOptions.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                  selectedIds.includes(p.id) ? "border-primary bg-primary/5" : "hover:bg-muted/40",
                )}
              >
                <Checkbox
                  checked={selectedIds.includes(p.id)}
                  onCheckedChange={() => toggle(p.id)}
                />
                {p.main_image_path ? (
                  <img
                    src={publicUrl("product-images", p.main_image_path) ?? ""}
                    alt={p.name}
                    className="h-9 w-9 rounded object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 rounded bg-muted" />
                )}
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </Field>
      <SaveButton saving={saving} />
    </form>
  );
}

/* ============================
 * Testimonials editor
 * ============================ */
function TestimonialsEditor({ section }: { section: LandingSectionFull }) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [items, setItems] = React.useState<
    { author: string; role: string; quote: string; project: string }[]
  >(
    (section.config.items as { author: string; role: string; quote: string; project: string }[]) ?? [
      { author: "", role: "", quote: "", project: "" },
    ],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, config: { items } });
      }}
      className="space-y-4"
    >
      <Field label="Judul section">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-2 rounded-md border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nama author"
                value={item.author}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, author: e.target.value } : x)),
                  )
                }
                disabled={saving}
              />
              <Input
                placeholder="Peran (opsional)"
                value={item.role}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x, i) => (i === idx ? { ...x, role: e.target.value } : x)),
                  )
                }
                disabled={saving}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              rows={2}
              placeholder="Isi testimoni"
              value={item.quote}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, quote: e.target.value } : x)),
                )
              }
              disabled={saving}
            />
            <Input
              placeholder="Nama proyek (opsional)"
              value={item.project}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((x, i) => (i === idx ? { ...x, project: e.target.value } : x)),
                )
              }
              disabled={saving}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          setItems((prev) => [...prev, { author: "", role: "", quote: "", project: "" }])
        }
        disabled={saving}
      >
        <Plus className="h-4 w-4" />
        Tambah Testimoni
      </Button>
      <div>
        <SaveButton saving={saving} />
      </div>
    </form>
  );
}

/* ============================
 * CTA editor
 * ============================ */
function CtaEditor({ section }: { section: LandingSectionFull }) {
  const { saving, save } = useSaveSection(section.section_key);
  const [heading, setHeading] = React.useState(section.heading ?? "");
  const [subheading, setSubheading] = React.useState(section.subheading ?? "");
  const [ctaLabel, setCtaLabel] = React.useState(
    (section.config.cta_label as string) ?? "Tanya Harga via WhatsApp",
  );
  const [ctaHref, setCtaHref] = React.useState(
    (section.config.cta_href as string) ?? "whatsapp",
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ heading, subheading, config: { cta_label: ctaLabel, cta_href: ctaHref } });
      }}
      className="space-y-4"
    >
      <Field label="Judul">
        <Input value={heading} onChange={(e) => setHeading(e.target.value)} disabled={saving} />
      </Field>
      <Field label="Subjudul">
        <Input
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          disabled={saving}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label tombol CTA">
          <Input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} disabled={saving} />
        </Field>
        <Field label="Tujuan CTA" hint="whatsapp = arahkan ke WA, /katalog = ke halaman katalog">
          <select
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
            disabled={saving}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="/katalog">Halaman Katalog</option>
          </select>
        </Field>
      </div>
      <SaveButton saving={saving} />
    </form>
  );
}