import Link from "next/link";
import { ListChecks, Plus, ArrowRight } from "lucide-react";
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
import { fetchCategoriesWithTemplate } from "@/lib/actions/spec-template-actions";

export default async function SpecTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: focused } = await searchParams;
  const categories = await fetchCategoriesWithTemplate().catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Spesifikasi"
        description="Tentukan field spesifikasi teknis per kategori. Produk akan mengikuti template ini."
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Belum ada kategori"
          description="Buat kategori terlebih dahulu sebelum menentukan template spesifikasi."
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
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Status Template</TableHead>
                <TableHead className="text-center">Jumlah Field</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow
                  key={c.id}
                  className={focused === c.id ? "bg-primary/5" : undefined}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.slug}</code>
                  </TableCell>
                  <TableCell className="text-center">
                    {c.template_id ? (
                      c.template_active ? (
                        <Badge variant="success">Aktif</Badge>
                      ) : (
                        <Badge variant="warning">Nonaktif</Badge>
                      )
                    ) : (
                      <Badge variant="outline">Belum dibuat</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.template_id ? c.field_count : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/spec-templates/${c.id}`}>
                        {c.template_id ? "Kelola" : "Buat"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}