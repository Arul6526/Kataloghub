import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft }
 from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpecTemplateEditor } from "@/components/admin//spec-template-editor";
import { fetchCategoryTemplate } from "@/lib/actions/spec-template-actions";
import { TriangleAlert } from "lucide-react";

export default async function EditSpecTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchCategoryTemplate(id).catch(() => null);
  if (!data) notFound();

  const initialFields = data.fields;
  const initialActive = data.template?.is_active ?? true;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/spec-templates">
          <ChevronLeft className="h-4 w-4" />
          Kembali ke daftar template
        </Link>
      </Button>

      <PageHeader
        title={`Template Spesifikasi · ${data.category.name}`}
        description="Tentukan field teknis untuk semua produk dalam kategori ini."
      />

      <Alert>
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Catatan perubahan template</AlertTitle>
        <AlertDescription>
          Mengubah atau menghapus field yang sudah dipakai produk existing dapat
          membuat data spesifikasi produk menjadi tidak konsisten. Ubah dengan hati-hati.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <SpecTemplateEditor
          categoryId={id}
          initialFields={initialFields}
          initialActive={initialActive}
        />
      </div>
    </div>
  );
}