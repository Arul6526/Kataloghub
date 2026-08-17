"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { toggleProductVisibleAction } from "@/lib/actions/product-actions";

export function ProductRowToggle({
  id,
  is_visible,
  canShow,
}: {
  id: string;
  is_visible: boolean;
  canShow: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function handleToggle() {
    if (!is_visible && !canShow) {
      toast({
        variant: "error",
        title: "Tidak bisa menampilkan produk",
        description: "Pastikan foto utama & field wajib sudah lengkap.",
      });
      return;
    }
    setLoading(true);
    const res = await toggleProductVisibleAction(id, !is_visible);
    setLoading(false);
    if (!res.ok) {
      toast({ variant: "error", title: "Gagal", description: res.error });
      return;
    }
    toast({
      variant: "success",
      title: is_visible ? "Produk disembunyikan" : "Produk ditampilkan",
    });
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-1">
      {is_visible ? (
        <Eye className="h-3 w-3 text-emerald-600" />
      ) : (
        <EyeOff className="h-3 w-3 text-muted-foreground" />
      )}
      <Switch
        checked={is_visible}
        onCheckedChange={handleToggle}
        disabled={loading}
        aria-label="Toggle visibilitas produk"
      />
    </div>
  );
}