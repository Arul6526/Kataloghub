"use client";

import { useState } from "react";
import { Upload, AlertCircle, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import * as xlsx from "xlsx";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { bulkImportProductsAction, type BulkImportResult } from "@/lib/actions/product-actions";

// ---------- FIELD MAPPING ----------
// Maps known product fields to all possible column name variations.
// Case-insensitive matching is applied during parsing.
const FIELD_ALIASES: Record<string, string[]> = {
  name:           ["nama", "name", "product name", "nama produk", "judul", "title"],
  category_slug:  ["kategori slug", "category slug", "category_slug", "kategori_slug", "kategori", "category", "kat"],
  slug:           ["slug"],
  summary:        ["ringkasan", "summary", "deskripsi singkat", "short description"],
  description:    ["deskripsi", "description", "keterangan", "detail"],
  is_visible:     ["status", "is_visible", "is visible", "tampilkan", "visible", "publish", "aktif"],
  sort_order:     ["urutan", "sort order", "sort_order", "order", "no", "nomor"],
  main_image_path:["gambar utama", "main image", "main_image_path", "foto utama", "image", "gambar", "foto"],
  gallery:        ["galeri", "gallery", "foto galeri", "images", "gambar tambahan"],
  tags:           ["tags", "tag", "label"],
};

/** Find the field key for a given column name using case-insensitive matching */
function resolveField(colName: string): string | null {
  const lower = colName.trim().toLowerCase();
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === lower)) return field;
  }
  return null;
}

/** Parse a row object from xlsx into a structured product import item */
function parseRow(row: Record<string, unknown>, index: number) {
  const resolved: Record<string, unknown> = {};

  // Map all columns to their corresponding field
  for (const [col, val] of Object.entries(row)) {
    const field = resolveField(col);
    if (field && !(field in resolved)) {
      resolved[field] = val;
    }
  }

  const nameVal = resolved["name"];
  const catVal = resolved["category_slug"];
  const slugVal = resolved["slug"];
  const summaryVal = resolved["summary"];
  const descVal = resolved["description"];
  const sortVal = resolved["sort_order"];
  const mainImgVal = resolved["main_image_path"];
  const galleryVal = resolved["gallery"];
  const tagsVal = resolved["tags"];

  // Parse is_visible
  let is_visible = false;
  const visibleRaw = resolved["is_visible"];
  if (visibleRaw !== undefined && visibleRaw !== null) {
    const s = String(visibleRaw).trim().toLowerCase();
    is_visible = s === "true" || s === "1" || s === "ya" || s === "yes" || s === "aktif";
  }

  // Parse sort_order
  const sortOrder = sortVal !== undefined && sortVal !== null
    ? parseInt(String(sortVal), 10)
    : 0;

  // Parse gallery (comma-separated URLs)
  let gallery: { path: string; alt: string }[] = [];
  if (galleryVal) {
    gallery = String(galleryVal)
      .split(/[,;|]/)
      .map((url) => ({ path: url.trim(), alt: String(nameVal ?? "") }))
      .filter((g) => g.path !== "");
  }

  // Parse tags (comma-separated)
  let tags: string[] = [];
  if (tagsVal) {
    tags = String(tagsVal)
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return {
    _rowIndex: index + 2,
    name: nameVal != null ? String(nameVal).trim() : "",
    category_slug: catVal != null ? String(catVal).trim() : "",
    slug: slugVal ? String(slugVal).trim() : undefined,
    summary: summaryVal ? String(summaryVal).trim() : undefined,
    description: descVal ? String(descVal).trim() : undefined,
    is_visible,
    sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    main_image_path: mainImgVal ? String(mainImgVal).trim() : undefined,
    gallery: gallery.length > 0 ? gallery : undefined,
    tags: tags.length > 0 ? tags : undefined,
  };
}

// ---------- COMPONENT ----------

type Step = "idle" | "preview" | "done";

export function ImportProductButton() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [parsedItems, setParsedItems] = useState<ReturnType<typeof parseRow>[]>([]);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const { toast } = useToast();

  const reset = () => {
    setFile(null);
    setStep("idle");
    setErrorMsg(null);
    setDetectedColumns([]);
    setParsedItems([]);
    setImportResult(null);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStep("idle");
      setErrorMsg(null);
      setDetectedColumns([]);
      setParsedItems([]);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setErrorMsg("Pilih file terlebih dahulu.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (jsonData.length === 0) {
        throw new Error("File tidak memiliki baris data.");
      }

      const cols = Object.keys(jsonData[0]);
      setDetectedColumns(cols);

      const items = jsonData.map((row, i) => parseRow(row, i));
      setParsedItems(items);
      setStep("preview");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca file.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (parsedItems.length === 0) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await bulkImportProductsAction(parsedItems);
      setImportResult(result);
      setStep("done");

      if (result.successCount > 0) {
        toast({
          variant: "success",
          title: "Import Selesai",
          description: `${result.successCount} dari ${result.total} produk berhasil ditambahkan.`,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan tak terduga.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Nama: "Produk Contoh",
        "Kategori Slug": "kategori-contoh",
        Slug: "produk-contoh-1",
        Ringkasan: "Ringkasan produk",
        Deskripsi: "Deskripsi lengkap produk",
        Status: "true",
        Urutan: 1,
        Tags: "pompa, industri",
        "Gambar Utama": "https://example.com/main.jpg",
        Galeri: "https://example.com/g1.jpg, https://example.com/g2.jpg",
      },
    ];
    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Template");
    xlsx.writeFile(workbook, "Template_Import_Produk.xlsx");
  };

  // Which detected columns matched to known fields
  const mappedCols = detectedColumns.filter((c) => resolveField(c) !== null);
  const unmappedCols = detectedColumns.filter((c) => resolveField(c) === null);
  const readyCount = parsedItems.filter((i) => !!i.name).length;
  const skippedCount = parsedItems.filter((i) => !i.name).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Produk</DialogTitle>
          <DialogDescription>
            Upload file Excel (.xlsx) atau CSV — sistem akan membaca kolom yang tersedia secara
            otomatis, tanpa format yang ketat.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <span className={step === "idle" ? "text-primary font-semibold" : ""}>1. Upload</span>
          <ChevronRight className="h-3 w-3" />
          <span className={step === "preview" ? "text-primary font-semibold" : ""}>2. Preview</span>
          <ChevronRight className="h-3 w-3" />
          <span className={step === "done" ? "text-primary font-semibold" : ""}>3. Selesai</span>
        </div>

        {/* ── STEP 1: Upload ── */}
        {step === "idle" && (
          <div className="grid gap-4 py-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="file">File CSV / Excel (.xlsx)</Label>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleDownloadTemplate}>
                <Download className="mr-1 h-3 w-3" />
                Download Template
              </Button>
            </div>
            <Input
              id="file"
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {file && (
              <p className="text-xs text-muted-foreground">
                File dipilih: <span className="font-medium text-foreground">{file.name}</span>
              </p>
            )}

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-semibold mb-1">Kolom yang dikenali (fleksibel):</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {Object.entries(FIELD_ALIASES).map(([field, aliases]) => (
                  <div key={field}>
                    <span className="font-medium text-foreground capitalize">{field.replace(/_/g, " ")}</span>
                    {": "}
                    <span className="text-muted-foreground">{aliases.slice(0, 3).join(", ")}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-muted-foreground">Kolom lain yang tidak dikenali akan diabaikan.</p>
              <p className="mt-1 text-blue-600 font-medium">💡 Kategori yang belum ada akan dibuat otomatis.</p>
            </div>

            {errorMsg && (
              <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs ml-2">{errorMsg}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* ── STEP 2: Preview ── */}
        {step === "preview" && (
          <div className="grid gap-4 py-2">
            {/* Column detection summary */}
            <div className="bg-muted rounded-md p-3 text-xs space-y-2">
              <p className="font-semibold">Kolom terdeteksi dari file:</p>

              {mappedCols.length > 0 && (
                <div>
                  <p className="text-green-700 font-medium mb-1">✓ Dikenali ({mappedCols.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {mappedCols.map((c) => (
                      <span key={c} className="bg-green-100 text-green-800 rounded px-1.5 py-0.5">
                        {c} → {resolveField(c)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {unmappedCols.length > 0 && (
                <div>
                  <p className="text-amber-700 font-medium mb-1">⚠ Diabaikan ({unmappedCols.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {unmappedCols.map((c) => (
                      <span key={c} className="bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Row summary */}
            <div className="bg-muted rounded-md p-3 text-xs space-y-1">
              <p className="font-semibold">Ringkasan data:</p>
              <p>
                Total baris:{" "}
                <span className="font-medium text-foreground">{parsedItems.length}</span>
              </p>
              <p>
                Siap diimport (punya nama):{" "}
                <span className="font-medium text-green-700">{readyCount}</span>
              </p>
              {skippedCount > 0 && (
                <p>
                  Akan dilewati (nama kosong):{" "}
                  <span className="font-medium text-amber-700">{skippedCount}</span>
                </p>
              )}
              {/* Unique categories */}
              {(() => {
                const cats = [...new Set(parsedItems.map((i) => i.category_slug).filter(Boolean))];
                return cats.length > 0 ? (
                  <div className="pt-1 border-t mt-1">
                    <p className="font-medium text-foreground">Kategori ({cats.length}):</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cats.map((cat) => (
                        <span key={cat} className="bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-[10px]">
                          {cat}
                        </span>
                      ))}
                    </div>
                    <p className="text-blue-600 mt-1">💡 Kategori yang belum ada akan dibuat otomatis.</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Preview table – first 5 rows */}
            {parsedItems.length > 0 && (
              <div className="overflow-x-auto text-xs rounded border">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold">Baris</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Nama</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Kategori</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedItems.slice(0, 8).map((item) => (
                      <tr key={item._rowIndex} className={!item.name ? "bg-amber-50" : ""}>
                        <td className="px-2 py-1 text-muted-foreground">{item._rowIndex}</td>
                        <td className="px-2 py-1">
                          {item.name || <span className="text-destructive italic">kosong</span>}
                        </td>
                        <td className="px-2 py-1">
                          {item.category_slug
                            ? <span className="text-blue-700">{item.category_slug}</span>
                            : <span className="text-muted-foreground italic">→ Uncategorized</span>
                          }
                        </td>
                        <td className="px-2 py-1">
                          {item.name ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-amber-600">dilewati</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedItems.length > 8 && (
                  <p className="text-center text-muted-foreground py-1 text-xs">
                    ...dan {parsedItems.length - 8} baris lainnya
                  </p>
                )}
              </div>
            )}

            {errorMsg && (
              <Alert className="border-destructive/50 bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs ml-2">{errorMsg}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === "done" && importResult && (
          <div className="grid gap-4 py-2">
            <div className="bg-muted rounded-md p-4 text-sm space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold">Proses Import Selesai</p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">{importResult.successCount}</p>
                  <p className="text-xs text-muted-foreground">Berhasil</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{importResult.failedCount}</p>
                  <p className="text-xs text-muted-foreground">Gagal</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">{importResult.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-600">Detail kegagalan:</p>
                <div className="max-h-48 overflow-y-auto rounded border divide-y text-xs">
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="px-3 py-2">
                      <span className="font-medium">Baris {err.rowIndex}</span>
                      {err.name && <span className="text-muted-foreground"> — {err.name}</span>}
                      <p className="text-red-600 mt-0.5">{err.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === "idle" && (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                Batal
              </Button>
              <Button onClick={handlePreview} disabled={!file || isLoading}>
                {isLoading ? "Membaca..." : "Baca File"}
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={reset} disabled={isLoading}>
                Ganti File
              </Button>
              <Button onClick={handleImport} disabled={isLoading || readyCount === 0}>
                {isLoading ? "Mengimpor..." : `Import ${readyCount} Produk`}
              </Button>
            </>
          )}

          {step === "done" && (
            <>
              <Button variant="outline" onClick={reset}>
                Import Lagi
              </Button>
              <Button onClick={() => handleOpenChange(false)}>
                Tutup
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
