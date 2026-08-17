"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  TriangleAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ProductRowToggle } from "./row-toggle";
import { publicUrl } from "@/lib/storage-url";
import { bulkDeleteProductsAction } from "@/lib/actions/product-actions";
import type { ProductListItem } from "@/lib/actions/product-actions";

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface ProductsTableClientProps {
  products: ProductListItem[];
  categoryOptions: { value: string; label: string }[];
  searchParams: { q: string; category: string; visible: string };
  pagination: PaginationInfo;
}

export function ProductsTableClient({
  products,
  categoryOptions,
  searchParams,
  pagination,
}: ProductsTableClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [search, setSearch] = React.useState(searchParams.q);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Reset selection when products list changes (e.g. page change)
  React.useEffect(() => {
    setSelected(new Set());
  }, [products]);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search) next.set("q", search);
      else next.delete("q");
      next.delete("page");
      router.replace(`/admin/products?${next.toString()}`);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`/admin/products?${next.toString()}`);
  }

  function goToPage(p: number) {
    const next = new URLSearchParams(params.toString());
    if (p <= 1) next.delete("page");
    else next.set("page", String(p));
    router.push(`/admin/products?${next.toString()}`);
  }

  // Checkbox logic
  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = allIds.some((id) => selected.has(id));

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selected);
      allIds.forEach((id) => next.delete(id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      allIds.forEach((id) => next.add(id));
      setSelected(next);
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleBulkDelete() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      const result = await bulkDeleteProductsAction(ids);
      if (result.ok) {
        toast({
          variant: "success",
          title: "Produk dihapus",
          description: `${ids.length} produk berhasil dihapus.`,
        });
        setSelected(new Set());
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast({
          variant: "error",
          title: "Gagal menghapus",
          description: result.error,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const { page, totalPages, total, pageSize } = pagination;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={searchParams.category || "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.visible || "all"}
          onValueChange={(v) => updateParam("visible", v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="true">Tampil</SelectItem>
            <SelectItem value="false">Sembunyi</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
          {total} produk
        </span>
      </div>

      {/* Bulk action toolbar — appears when items are selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-destructive">
              {selectedCount} produk dipilih
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Batal pilih
            </button>
          </div>

          {!confirmOpen ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Hapus {selectedCount} Produk
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">
                Yakin hapus {selectedCount} produk? Tidak bisa dibatalkan!
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmOpen(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          )}
        </div>
      )}

      {products.length > 0 ? (
        <>
          <div className="rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Select all checkbox */}
                  <TableHead className="w-[44px]">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer accent-primary"
                      aria-label="Pilih semua"
                    />
                  </TableHead>
                  <TableHead className="w-[64px]">Foto</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Spec</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[60px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const isSelected = selected.has(p.id);
                  return (
                    <TableRow
                      key={p.id}
                      className={isSelected ? "bg-muted/50" : undefined}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(p.id)}
                          className="h-4 w-4 cursor-pointer accent-primary"
                          aria-label={`Pilih ${p.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        {p.main_image_path ? (
                          <img
                            src={publicUrl("product-images", p.main_image_path) ?? ""}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground">
                            <span className="text-[10px]">—</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center flex-wrap gap-1.5">
                          <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                            {p.name}
                          </Link>
                          {(p.main_image_path?.startsWith("/demo-atk/") || p.main_image_path?.includes("unsplash.com")) && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5 font-bold">
                              Sampel / Edit Saya
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">/{p.slug}</div>
                      </TableCell>
                      <TableCell>{p.category_name}</TableCell>
                      <TableCell className="text-center">
                        {!p.has_required_specs ? (
                          <Badge variant="warning" className="gap-1">
                            <TriangleAlert className="h-3 w-3" /> Belum lengkap
                          </Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <ProductRowToggle
                          id={p.id}
                          is_visible={p.is_visible}
                          canShow={p.has_required_specs && Boolean(p.main_image_path)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-medium text-foreground">{start}–{end}</span> dari{" "}
              <span className="font-medium text-foreground">{total}</span> produk
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goToPage(1)} disabled={page <= 1}
                aria-label="Halaman pertama"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goToPage(page - 1)} disabled={page <= 1}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 3) pages.push("...");
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                    pages.push(i);
                  }
                  if (page < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="icon" className="h-8 w-8 text-sm"
                      onClick={() => goToPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                );
              })()}

              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => goToPage(totalPages)} disabled={page >= totalPages}
                aria-label="Halaman terakhir"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada produk ditemukan.</p>
      )}
    </div>
  );
}