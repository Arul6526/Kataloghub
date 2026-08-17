"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Wand2,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import { saveTemplateAction, type ActionResult } from "@/lib/actions/spec-template-actions";
import type { CategorySpecField } from "@/lib/db/types";
import type { SpecFieldFormValues } from "@/lib/validators/spec-field";

const FIELD_TYPES: { value: SpecFieldFormValues["field_type"]; label: string; hint: string }[] = [
  { value: "text", label: "Teks", hint: "String bebas" },
  { value: "number", label: "Angka", hint: "Numerik dengan satuan opsional" },
  { value: "boolean", label: "Ya/Tidak", hint: "Nilai biner" },
  { value: "select", label: "Pilihan", hint: "Daftar opsi tetap" },
];

function emptyField(sortOrder: number): SpecFieldFormValues {
  return {
    id: undefined,
    label: "",
    field_key: "",
    field_type: "text",
    options: [],
    unit: "",
    is_required: false,
    is_filterable: false,
    sort_order: sortOrder,
  };
}

export function SpecTemplateEditor({
  categoryId,
  initialFields,
  initialActive,
}: {
  categoryId: string;
  initialFields: CategorySpecField[];
  initialActive: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [fields, setFields] = React.useState<SpecFieldFormValues[]>(() =>
    initialFields.length > 0
      ? initialFields.map((f) => ({
          id: f.id,
          label: f.label,
          field_key: f.field_key,
          field_type: f.field_type,
          options: f.options ?? [],
          unit: f.unit ?? "",
          is_required: f.is_required,
          is_filterable: f.is_filterable,
          sort_order: f.sort_order,
        }))
      : [emptyField(0)],
  );
  const [isActive, setIsActive] = React.useState(initialActive);
  const [loading, setLoading] = React.useState(false);

  function update(idx: number, patch: Partial<SpecFieldFormValues>) {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    );
  }

  function addField() {
    setFields((prev) => [...prev, emptyField(prev.length)]);
  }

  function removeField(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  function move(idx: number, direction: "up" | "down") {
    setFields((prev) => {
      const next = [...prev];
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function autoKey(idx: number) {
    setFields((prev) =>
      prev.map((f, i) =>
        i === idx && !f.field_key ? { ...f, field_key: slugify(f.label).replace(/-/g, "_") } : f,
      ),
    );
  }

  async function handleSave() {
    setLoading(true);
    const res: ActionResult = await saveTemplateAction(categoryId, isActive, fields);
    setLoading(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan", description: res.error });
      return;
    }
    toast({ variant: "success", title: "Template disimpan" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="template_active">Template aktif</Label>
          <p className="text-xs text-muted-foreground">
            Bila aktif, produk dalam kategori ini akan divalidasi terhadap field di bawah.
          </p>
        </div>
        <Switch
          id="template_active"
          checked={isActive}
          onCheckedChange={setIsActive}
          disabled={loading}
        />
      </div>

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Belum ada field. Tambahkan field pertama di bawah.
          </div>
        ) : (
          fields.map((field, idx) => (
            <FieldRow
              key={idx}
              field={field}
              idx={idx}
              total={fields.length}
              disabled={loading}
              onChange={(patch) => update(idx, patch)}
              onRemove={() => removeField(idx)}
              onMove={(dir) => move(idx, dir)}
              onAutoKey={() => autoKey(idx)}
            />
          )
        )
      )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={addField} disabled={loading}>
          <Plus className="h-4 w-4" />
          Tambah Field
        </Button>
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Template
        </Button>
      </div>
    </div>
  );
}

function FieldRow({
  field,
  idx,
  total,
  disabled,
  onChange,
  onRemove,
  onMove,
  onAutoKey,
}: {
  field: SpecFieldFormValues;
  idx: number;
  total: number;
  disabled: boolean;
  onChange: (patch: Partial<SpecFieldFormValues>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
  onAutoKey: () => void;
}) {
  const [optionsText, setOptionsText] = React.useState(field.options.join("\n"));
  const [showOptions, setShowOptions] = React.useState(field.field_type === "select");

  React.useEffect(() => {
    setShowOptions(field.field_type === "select");
  }, [field.field_type]);

  function handleOptionsChange(value: string) {
    setOptionsText(value);
    const opts = value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ options: opts });
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <GripVertical className="h-3.5 w-3.5" />
          Field #{idx + 1}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onMove("up")}
            disabled={disabled || idx === 0}
            aria-label="Naik"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onMove("down")}
            disabled={disabled || idx === total - 1}
            aria-label="Turun"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onRemove}
            disabled={disabled}
            className="text-destructive"
            aria-label="Hapus field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label" required hint="Teks yang tampil di form & halaman publik">
          <Input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            disabled={disabled}
            placeholder="mis. Material"
            required
          />
        </Field>
        <Field
          label="Key"
          required
          hint="Identifier unik di template (snake_case)"
        >
          <div className="flex gap-1.5">
            <Input
              value={field.field_key}
              onChange={(e) => onChange({ field_key: e.target.value })}
              disabled={disabled}
              placeholder="material"
              required
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onAutoKey}
              disabled={disabled || !field.label}
              aria-label="Generate key dari label"
              title="Generate dari label"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Tipe field" required>
          <Select
            value={field.field_type}
            onValueChange={(v) => onChange({ field_type: v as SpecFieldFormValues["field_type"] })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label} <span className="text-xs text-muted-foreground">· {t.hint}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Satuan" hint="Opsional, mis. mm, Volt, kg">
          <Input
            value={field.unit}
            onChange={(e) => onChange({ unit: e.target.value })}
            disabled={disabled || field.field_type !== "number"}
            placeholder="mm"
          />
        </Field>
      </div>

      {showOptions && (
        <div className="mt-3">
          <Field label="Pilihan opsi" hint="Satu opsi per baris.">
            <textarea
              value={optionsText}
              onChange={(e) => handleOptionsChange(e.target.value)}
              disabled={disabled}
              rows={4}
              placeholder={"Besi\nAluminium\nStainless"}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </Field>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={field.is_required}
            onCheckedChange={(v) => onChange({ is_required: v })}
            disabled={disabled}
          />
          Field wajib
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={field.is_filterable}
            onCheckedChange={(v) => onChange({ is_filterable: v })}
            disabled={disabled}
          />
          Bisa dipakai sebagai filter publik
        </label>
      </div>
    </div>
  );
}