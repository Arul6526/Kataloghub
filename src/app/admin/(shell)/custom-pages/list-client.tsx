"use client";

import * as React from "react";
import Link from "next/link";
import { Edit2, Trash2, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  deleteCustomLandingPageAction,
  toggleCustomLandingPageAction,
  revertToDefaultLandingPageAction,
  type CustomLandingPageListItem,
} from "@/lib/actions/custom-landing-actions";

interface CustomPagesListClientProps {
  pages: CustomLandingPageListItem[];
}

export function CustomPagesListClient({ pages: initialPages }: CustomPagesListClientProps) {
  const { toast } = useToast();
  const [pages, setPages] = React.useState(initialPages);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  async function handleToggle(id: string, isActive: boolean) {
    setTogglingId(id);
    const res = await toggleCustomLandingPageAction(id, isActive);
    setTogglingId(null);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal", description: res.error });
      return;
    }
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)));
    toast({ variant: "success", title: isActive ? "Halaman diaktifkan" : "Halaman dinonaktifkan" });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteCustomLandingPageAction(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal hapus", description: res.error });
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast({ variant: "success", title: "Halaman dihapus" });
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/lp/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ variant: "success", title: "Link disalin", description: url });
    });
  }

  async function handleRevertDefault() {
    setDeleting(true); // Reusing deleting state for loading spinner if needed
    const res = await revertToDefaultLandingPageAction();
    setDeleting(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal", description: res.error });
      return;
    }
    setPages((prev) =>
      prev.map((p) => (p.slug === "home" ? { ...p, is_active: false } : p))
    );
    toast({
      variant: "success",
      title: "Berhasil",
      description: "Halaman utama telah dikembalikan ke Landing Page Default (pengaturan Sidebar).",
    });
  }

  const hasActiveHome = pages.some((p) => p.slug === "home" && p.is_active);

  return (
    <div className="space-y-4">
      {hasActiveHome && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
          <div>
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Custom Landing Page Sedang Aktif
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-400 mt-1">
              Halaman depan website Anda saat ini menggunakan Custom Landing Page dengan slug <code>home</code>.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevertDefault}
            disabled={deleting}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            🔄 Gunakan LP Default
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Judul</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">
                Slug / URL
              </th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">
                Produk
              </th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                {/* Judul */}
                <td className="px-4 py-3">
                  <div className="font-medium">{page.title}</div>
                  {page.meta_title && (
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {page.meta_title}
                    </div>
                  )}
                </td>

                {/* Slug */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs bg-muted rounded px-1.5 py-0.5 text-foreground/80">
                      /lp/{page.slug}
                    </code>
                    <button
                      onClick={() => copyLink(page.slug)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Salin link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    {page.is_active && (
                      <a
                        href={`/lp/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Buka halaman"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </td>

                {/* Produk count */}
                <td className="px-4 py-3 text-center hidden md:table-cell">
                  <Badge variant="secondary">
                    {page.product_ids?.length ?? 0} produk
                  </Badge>
                </td>

                {/* Status toggle */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Switch
                      checked={page.is_active}
                      onCheckedChange={(v) => handleToggle(page.id, v)}
                      disabled={togglingId === page.id}
                      aria-label="Toggle aktif"
                    />
                    <Badge variant={page.is_active ? "success" : "secondary"} className="hidden sm:inline-flex">
                      {page.is_active ? (
                        <><Eye className="h-3 w-3 mr-1" />Aktif</>
                      ) : (
                        <><EyeOff className="h-3 w-3 mr-1" />Nonaktif</>
                      )}
                    </Badge>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button asChild size="icon" variant="ghost" title="Edit halaman">
                      <Link href={`/admin/custom-pages/${page.id}`}>
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Hapus halaman"
                      onClick={() => setDeleteTarget({ id: page.id, title: page.title })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Custom Landing Page?"
        description={`Halaman "${deleteTarget?.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
