"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Eye,
  Code2,
  Package,
  Copy,
  Info,
  ChevronDown,
  Globe,
  RefreshCw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/toast";
import {
  saveCustomLandingPageAction,
  type SaveCustomLandingPageInput,
} from "@/lib/actions/custom-landing-actions";
import type { CustomLandingPage } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/storage-url";

/* ─────────────────────────────────────────────
 * Types
 * ───────────────────────────────────────────── */
interface ProductOption {
  id: string;
  name: string;
  slug: string;
  category_name: string;
  main_image_path: string | null;
}

interface EditorClientProps {
  mode: "new" | "edit";
  initial: CustomLandingPage | null;
  allProducts: ProductOption[];
}

/* ─────────────────────────────────────────────
 * Placeholder Helpers
 * ───────────────────────────────────────────── */
const PRODUCT_TOKEN_FIELDS = [
  { key: "name", label: "Nama Produk" },
  { key: "image", label: "URL Gambar Utama" },
  { key: "link", label: "Link Halaman Produk" },
  { key: "description", label: "Deskripsi Singkat" },
  { key: "card", label: "Card HTML Lengkap" },
] as const;

function makeToken(slug: string, field: string) {
  return `{{product:${slug}:${field}}}`;
}

/** Build a full product card HTML snippet */
function makeProductCard(product: ProductOption, imageUrl: string | null) {
  const img = imageUrl
    ? `<img src="${imageUrl}" alt="${product.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px 8px 0 0;">`
    : `<div style="width:100%;height:200px;background:#e5e7eb;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;">Tidak ada gambar</div>`;
  return `<div class="product-card" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;max-width:280px;font-family:sans-serif;">
  ${img}
  <div style="padding:12px 16px;">
    <h3 style="margin:0 0 4px;font-size:16px;font-weight:600;">${product.name}</h3>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">${product.category_name}</p>
    <a href="/products/${product.slug}" style="display:inline-block;padding:8px 16px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;font-size:13px;">Lihat Detail</a>
  </div>
</div>`;
}

/* ─────────────────────────────────────────────
 * Default template — satu file HTML lengkap
 * ───────────────────────────────────────────── */
const DEFAULT_SOURCE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Landing Page</title>
  <style>
    /* ── CSS langsung di sini ── */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      color: #1f2937;
      background: #ffffff;
    }
    .hero {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: white;
      padding: 80px 24px;
      text-align: center;
    }
    .hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; }
    .hero p { font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
    .container { max-width: 1200px; margin: 0 auto; padding: 48px 24px; }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <section class="hero">
    <h1>Judul Landing Page Anda</h1>
    <p>Tambahkan produk di panel kanan, lalu salin token ke kode ini.</p>
  </section>

  <div class="container">
    <h2>Produk Pilihan</h2>
    <div class="product-grid">
      <!-- Sisipkan token produk di sini, contoh: -->
      <!-- {{product:slug-produk:card}} -->
    </div>
  </div>

  <script>
    // ── JavaScript langsung di sini ──
    console.log("Custom landing page loaded");
  </script>
</body>
</html>`;

/* ─────────────────────────────────────────────
 * Slug auto-generate
 * ───────────────────────────────────────────── */
function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/* ─────────────────────────────────────────────
 * Line numbers helper
 * ───────────────────────────────────────────── */
function countLines(text: string): number {
  return text.split("\n").length;
}

/* ─────────────────────────────────────────────
 * Main Component
 * ───────────────────────────────────────────── */
export function EditorClient({ mode, initial, allProducts }: EditorClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  /* ── Form state ── */
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = React.useState(mode === "edit");
  const [isActive, setIsActive] = React.useState(initial?.is_active ?? false);
  const [metaTitle, setMetaTitle] = React.useState(initial?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = React.useState(initial?.meta_description ?? "");

  // Satu source code — gabungkan jika data lama punya css/js terpisah
  const initialSource = React.useMemo(() => {
    if (initial) {
      // Jika ada css_source/js_source yang terpisah dari versi sebelumnya, gabungkan
      const hasExtraCss = initial.css_source && initial.css_source.trim() && initial.css_source.trim() !== "/* CSS tambahan */";
      const hasExtraJs = initial.js_source && initial.js_source.trim() && initial.js_source.trim() !== "// JavaScript tambahan";
      if (hasExtraCss || hasExtraJs) {
        let merged = initial.html_source;
        const cssTag = hasExtraCss ? `\n<style>\n${initial.css_source}\n</style>` : "";
        const jsTag = hasExtraJs ? `\n<script>\n${initial.js_source}\n</script>` : "";
        if (merged.includes("</body>")) {
          merged = merged.replace("</body>", `${cssTag}${jsTag}\n</body>`);
        } else {
          merged += cssTag + jsTag;
        }
        return merged;
      }
      return initial.html_source;
    }
    return DEFAULT_SOURCE;
  }, [initial]);

  const [sourceCode, setSourceCode] = React.useState(initialSource);

  /* ── Product selection ── */
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(initial?.product_ids ?? []),
  );
  const [productSearch, setProductSearch] = React.useState("");
  const [productPanelOpen, setProductPanelOpen] = React.useState(true);

  /* ── UI state ── */
  const [saving, setSaving] = React.useState(false);
  const [previewKey, setPreviewKey] = React.useState(0);
  const previewDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  /* ── Slug auto-gen ── */
  React.useEffect(() => {
    if (!slugEdited && title) {
      setSlug(toSlug(title));
    }
  }, [title, slugEdited]);

  /* ── Sync line numbers scroll ── */
  function handleEditorScroll() {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  /* ── Preview HTML builder ── */
  const buildPreviewHtml = React.useCallback(() => {
    const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id));
    let html = sourceCode;

    for (const product of selectedProducts) {
      const imgUrl = publicUrl("product-images", product.main_image_path);
      const card = makeProductCard(product, imgUrl);

      html = html
        .replace(new RegExp(`\\{\\{product:${product.slug}:card\\}\\}`, "g"), card)
        .replace(
          new RegExp(`\\{\\{product:${product.slug}:name\\}\\}`, "g"),
          product.name,
        )
        .replace(
          new RegExp(`\\{\\{product:${product.slug}:image\\}\\}`, "g"),
          imgUrl ?? "",
        )
        .replace(
          new RegExp(`\\{\\{product:${product.slug}:link\\}\\}`, "g"),
          `/products/${product.slug}`,
        )
        .replace(
          new RegExp(`\\{\\{product:${product.slug}:description\\}\\}`, "g"),
          product.name,
        );
    }

    return html;
  }, [sourceCode, selectedIds, allProducts]);

  /* ── Debounced preview refresh ── */
  function schedulePreviewRefresh() {
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => setPreviewKey((k) => k + 1), 800);
  }

  React.useEffect(() => {
    schedulePreviewRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCode, selectedIds]);

  /* ── Save ── */
  async function handleSave() {
    if (!title.trim()) {
      toast({ variant: "error", title: "Judul wajib diisi" });
      return;
    }
    if (!slug.trim()) {
      toast({ variant: "error", title: "Slug wajib diisi" });
      return;
    }
    setSaving(true);
    const input: SaveCustomLandingPageInput = {
      id: initial?.id,
      title: title.trim(),
      slug: slug.trim(),
      html_source: sourceCode,
      css_source: "",
      js_source: "",
      is_active: isActive,
      product_ids: Array.from(selectedIds),
      meta_title: metaTitle || undefined,
      meta_description: metaDesc || undefined,
    };
    const res = await saveCustomLandingPageAction(input);
    setSaving(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menyimpan", description: res.error });
      return;
    }
    toast({ variant: "success", title: "Halaman disimpan" });
    if (mode === "new" && res.id) {
      router.push(`/admin/custom-pages/${res.id}`);
    } else {
      router.refresh();
    }
  }

  /* ── Product toggle ── */
  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /* ── Copy token to clipboard ── */
  function copyToken(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      toast({ variant: "success", title: "Token disalin", description: token });
    });
  }

  /* ── Insert token into editor at cursor position ── */
  function insertToken(token: string) {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = sourceCode;
      const newVal = val.substring(0, start) + token + val.substring(end);
      setSourceCode(newVal);
      requestAnimationFrame(() => {
        el.focus();
        el.selectionStart = el.selectionEnd = start + token.length;
      });
    } else {
      setSourceCode((prev) => prev + `\n${token}`);
    }
    toast({ variant: "success", title: "Token disisipkan ke editor" });
  }

  /* ── Auto-Integrate Links ── */
  function autoIntegrateLinks() {
    let changed = 0;
    const newVal = sourceCode.replace(/<a([^>]+)>([^<]+)<\/a>/gi, (match, attrs, text) => {
      const lowerText = text.toLowerCase().trim();
      let newHref = "";
      
      if (lowerText.includes("produk") || lowerText.includes("katalog") || lowerText.includes("belanja") || lowerText.includes("product")) {
        newHref = "/produk";
      } else if (lowerText.includes("kategori") || lowerText.includes("category")) {
        newHref = "/kategori";
      } else if (lowerText === "home" || lowerText.includes("beranda") || lowerText === "utama") {
        newHref = "/";
      } else if (lowerText.includes("whatsapp") || lowerText.includes("wa") || lowerText.includes("hubungi") || lowerText.includes("contact") || lowerText.includes("chat") || lowerText.includes("pesan")) {
        newHref = "{{site:whatsapp_url}}";
      }

      if (newHref) {
        if (/href=["'][^"']*["']/i.test(attrs)) {
          const newAttrs = attrs.replace(/href=["'][^"']*["']/i, `href="${newHref}"`);
          if (newAttrs !== attrs) {
            changed++;
            return `<a${newAttrs}>${text}</a>`;
          }
        } else {
          changed++;
          return `<a href="${newHref}"${attrs}>${text}</a>`;
        }
      }
      return match;
    });

    if (changed > 0) {
      setSourceCode(newVal);
      toast({ variant: "success", title: "Integrasi Berhasil!", description: `${changed} link navigasi telah diupdate otomatis.` });
    } else {
      toast({ variant: "info", title: "Tidak Ada Perubahan", description: "Tidak ditemukan teks link yang cocok untuk diotomatisasi, atau link sudah benar." });
    }
  }

  /* ── Filtered products ── */
  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category_name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id));
  const lineCount = countLines(sourceCode);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top meta panel ── */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Pengaturan Halaman
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="page-title">Judul Halaman *</Label>
            <Input
              id="page-title"
              placeholder="Promo Ramadan 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="page-slug">
              Slug (URL){" "}
              <span className="text-xs text-muted-foreground font-normal">
                → /lp/{slug || "…"}
              </span>
            </Label>
            <Input
              id="page-slug"
              placeholder="promo-ramadan-2026"
              value={slug}
              onChange={(e) => {
                setSlug(toSlug(e.target.value));
                setSlugEdited(true);
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="meta-title">Meta Title (SEO)</Label>
            <Input
              id="meta-title"
              placeholder="Promo Spesial – Brand Anda"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="meta-desc">Meta Description (SEO)</Label>
            <Input
              id="meta-desc"
              placeholder="Deskripsi singkat untuk mesin pencari…"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Switch
            id="is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
            aria-label="Aktifkan halaman"
          />
          <Label htmlFor="is-active" className="cursor-pointer">
            {isActive ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <Globe className="h-4 w-4" />
                Halaman Aktif (bisa diakses publik di /lp/{slug || "…"})
              </span>
            ) : (
              <span className="text-muted-foreground">
                Halaman Nonaktif (tidak bisa diakses publik)
              </span>
            )}
          </Label>
        </div>
      </div>

      {/* ── Main editor + product panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Left: unified code editor */}
        <div className="space-y-3">
          {/* Editor header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 shadow-sm">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">Source Code</span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Tulis HTML lengkap dengan &lt;style&gt; dan &lt;script&gt;
              </span>
            </div>
            <button
              type="button"
              onClick={autoIntegrateLinks}
              className="flex items-center gap-1.5 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
              title="Otomatis mengubah link '#' menjadi link internal yang benar (seperti ke /produk atau WhatsApp) berdasarkan teks tombolnya."
            >
              🪄 Auto-Integrasi Link
            </button>
          </div>

          {/* Code editor with line numbers */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                landing-page.html
              </span>
              <span className="text-[10px] text-zinc-500">
                {lineCount} baris · Token {"{{}}"} akan diganti otomatis
              </span>
            </div>
            <div className="relative flex" style={{ maxHeight: "560px" }}>
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="flex-none w-12 bg-zinc-900/50 border-r border-zinc-800 overflow-hidden select-none"
                style={{ maxHeight: "560px" }}
                aria-hidden="true"
              >
                <div className="pt-4 pb-4 px-2 text-right">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div
                      key={i}
                      className="text-[11px] leading-[1.7rem] text-zinc-600 font-mono"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                id="code-editor"
                className={cn(
                  "flex-1 resize-none bg-zinc-950 text-zinc-100 font-mono text-sm p-4",
                  "focus:outline-none leading-[1.7rem]",
                  "placeholder:text-zinc-600",
                  "scrollbar-thin scrollbar-track-zinc-900 scrollbar-thumb-zinc-700",
                )}
                style={{ maxHeight: "560px", minHeight: "400px" }}
                spellCheck={false}
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                onScroll={handleEditorScroll}
                onKeyDown={(e) => {
                  // Tab indentation
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const el = e.currentTarget;
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    const val = el.value;
                    const newVal = val.substring(0, start) + "  " + val.substring(end);
                    setSourceCode(newVal);
                    requestAnimationFrame(() => {
                      el.selectionStart = el.selectionEnd = start + 2;
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* Tip */}
          <div className="flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-3 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Tips:</strong> Tulis semua kode dalam satu file — HTML, <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">&lt;style&gt;</code>, dan <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">&lt;script&gt;</code> langsung di dalam HTML.
                Token <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">{"{{product:slug:field}}"}</code> akan diganti otomatis dengan data produk.
              </div>
            </div>
            <div className="ml-6 space-y-2 mt-2 text-xs">
              <p>🌟 <strong>Jadikan Halaman Utama:</strong> Gunakan slug <code>home</code> jika Anda ingin halaman ini menggantikan halaman depan (publik utama) website Anda. Navbar dan Footer bawaan akan tetap muncul.</p>
              <div>
                <p>🔗 <strong>Link Navigasi Internal (Tulis ini di dalam tag &lt;a&gt; HTML Anda):</strong></p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5 opacity-90 text-[11px]">
                  <li>Ke halaman semua produk: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">href=&quot;/produk&quot;</code></li>
                  <li>Ke halaman semua kategori: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">href=&quot;/kategori&quot;</code></li>
                  <li>Otomatis ke WhatsApp Admin: <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">href=&quot;{"{{site:whatsapp_url}}"}&quot;</code></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Product panel */}
        <div className="space-y-4">
          {/* Selected products & tokens */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 border-b bg-muted/50 text-sm font-semibold hover:bg-muted transition-colors"
              onClick={() => setProductPanelOpen((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produk Terhubung
                <Badge variant="secondary">{selectedIds.size}</Badge>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  productPanelOpen ? "rotate-180" : "",
                )}
              />
            </button>

            {productPanelOpen && (
              <div className="p-3 space-y-3">
                {/* Search */}
                <Input
                  placeholder="Cari produk…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="h-8 text-xs"
                />

                {/* Product list */}
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Tidak ada produk ditemukan
                    </p>
                  ) : (
                    filteredProducts.map((product) => (
                      <label
                        key={product.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors",
                          selectedIds.has(product.id)
                            ? "bg-primary/8 border border-primary/20"
                            : "hover:bg-muted border border-transparent",
                        )}
                      >
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleProduct(product.id)}
                          id={`prod-${product.id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{product.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {product.category_name}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Token generator for selected products */}
          {selectedProducts.length > 0 && (
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/50 text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Token Placeholder
              </div>
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold">{product.name}</span>
                    </div>
                    <div className="space-y-1 pl-4">
                      {PRODUCT_TOKEN_FIELDS.map((field) => {
                        const token = makeToken(product.slug, field.key);
                        return (
                          <div
                            key={field.key}
                            className="flex items-center gap-1.5 group"
                          >
                            <code className="flex-1 text-[10px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground truncate">
                              {token}
                            </code>
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => copyToken(token)}
                                className="p-1 hover:bg-muted rounded"
                                title={`Salin token ${field.label}`}
                              >
                                <Copy className="h-3 w-3 text-muted-foreground" />
                              </button>
                              <button
                                onClick={() => insertToken(token)}
                                className="p-1 hover:bg-primary/10 rounded text-primary"
                                title="Sisipkan ke editor"
                              >
                                <Code2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t bg-muted/30">
                <p className="text-[10px] text-muted-foreground">
                  Hover token → klik <Copy className="h-2.5 w-2.5 inline" /> untuk salin,
                  klik <Code2 className="h-2.5 w-2.5 inline" /> untuk sisipkan ke editor.
                </p>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-2 pb-1">
            <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Menyimpan…" : "Simpan Halaman"}
            </Button>
            {initial?.slug && (
              <a
                href={`/lp/${initial.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Lihat halaman publik /lp/{initial.slug}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <span className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Live Preview
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewKey((k) => k + 1)}
            className="gap-1.5 h-7 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
        <div className="relative bg-zinc-100 dark:bg-zinc-800">
          <iframe
            key={previewKey}
            srcDoc={buildPreviewHtml()}
            className="w-full border-0"
            style={{ minHeight: "520px" }}
            sandbox="allow-scripts allow-same-origin"
            title="Preview custom landing page"
          />
        </div>
      </div>
    </div>
  );
}
