"use client";

import * as React from "react";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  deleteCategoryAction,
  toggleCategoryVisibleAction,
} from "@/lib/actions/category-actions";
import { useRouter } from "next/navigation";

export function CategoryRowActions({
  id,
  name,
  is_visible,
  product_count,
}: {
  id: string;
  name: string;
  is_visible: boolean;
  product_count: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [toggling, setToggling] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteCategoryAction(id);
    setDeleting(false);
    setConfirmOpen(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menghapus", description: res.error });
      return;
    }
    toast({ variant: "success", title: "Kategori dihapus" });
    router.refresh();
  }

  async function handleToggle() {
    setToggling(true);
    const res = await toggleCategoryVisibleAction(id, !is_visible);
    setToggling(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal mengubah status", description: res.error });
      return;
    }
    toast({
      variant: "success",
      title: is_visible ? "Kategori disembunyikan" : "Kategori ditampilkan",
    });
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" disabled={toggling}>
            {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleToggle} disabled={toggling}>
            {is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {is_visible ? "Sembunyikan" : "Tampilkan"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-destructive focus:text-destructive"
            disabled={product_count > 0}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Hapus kategori "${name}"?`}
        description="Tindakan ini tidak bisa dibatalkan."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}