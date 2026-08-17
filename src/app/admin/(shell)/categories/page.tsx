import Link from "next/link";
import { Plus, FolderTree, Pencil, Eye, EyeOff, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryRowActions } from "./row-actions";
import { fetchCategories } from "@/lib/actions/category-actions";

const PAGE_SIZE = 20;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { items: categories, total } = await fetchCategories({
    limit: PAGE_SIZE,
    offset,
    search: q,
  }).catch(() => ({ items: [], total: 0 }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/categories${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        description="Kelompokkan katalog produk. Setiap kategori memiliki template spesifikasi tersendiri."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{total} kategori</span>
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus className="h-4 w-4" />
                Tambah Kategori
              </Link>
            </Button>
          </div>
        }
      />

      {total === 0 ? (
        <EmptyState
          icon={<FolderTree className="h-6 w-6" />}
          title="Belum ada kategori"
          description="Buat kategori pertama untuk mulai mengelompokkan produk."
          action={
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus className="h-4 w-4" />
                Tambah Kategori
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Urut</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-center">Produk</TableHead>
                  <TableHead className="text-center">Template</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.sort_order}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.slug}</code>
                    </TableCell>
                    <TableCell className="text-center">{c.product_count}</TableCell>
                    <TableCell className="text-center">
                      {c.has_template ? (
                        <Badge variant="success">Ada</Badge>
                      ) : (
                        <Badge variant="outline">Belum</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {c.is_visible ? (
                        <Badge variant="success">
                          <Eye className="h-3 w-3" /> Tampil
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3" /> Sembunyi
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/admin/categories/${c.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <CategoryRowActions
                          id={c.id}
                          name={c.name}
                          is_visible={c.is_visible}
                          product_count={c.product_count}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 px-1">
              <p className="text-sm text-muted-foreground">
                Menampilkan <span className="font-medium text-foreground">{start}–{end}</span> dari{" "}
                <span className="font-medium text-foreground">{total}</span> kategori
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" asChild disabled={page <= 1}>
                  <Link href={pageUrl(1)} aria-label="Halaman pertama">
                    <ChevronsLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild disabled={page <= 1}>
                  <Link href={pageUrl(page - 1)} aria-label="Sebelumnya">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <span className="px-2 text-sm">
                  Hal. <span className="font-semibold">{page}</span> / {totalPages}
                </span>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild disabled={page >= totalPages}>
                  <Link href={pageUrl(page + 1)} aria-label="Berikutnya">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" asChild disabled={page >= totalPages}>
                  <Link href={pageUrl(totalPages)} aria-label="Halaman terakhir">
                    <ChevronsRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}