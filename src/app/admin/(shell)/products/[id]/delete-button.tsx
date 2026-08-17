"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deleteProductAction } from "@/lib/actions/product-actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onConfirm() {
    setLoading(true);
    const res = await deleteProductAction(id);
    setLoading(false);
    setOpen(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal menghapus", description: res.error });
      return;
    }
    toast({ variant: "success", title: "Produk dihapus" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Hapus Produk
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Hapus produk "${name}"?`}
        description="Tindakan ini menghapus produk beserta media & dokumen terkait. Tidak bisa dibatalkan."
        loading={loading}
        onConfirm={onConfirm}
      />
    </>
  );
}