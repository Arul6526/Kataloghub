"use client";

import { useState } from "react";
import { updateOwnerSubscriptionAction, toggleOwnerStatusAction } from "@/lib/actions/saas-actions";
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "@/lib/db/types";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Ban, CheckCircle2, Loader2, Crown } from "lucide-react";

interface EditSubscriptionModalProps {
  userId: string;
  brandName: string;
  email: string;
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLAN_PRESETS: Record<SubscriptionPlan, { maxProducts: number; maxLandingPages: number }> = {
  free_trial: { maxProducts: 5, maxLandingPages: 1 },
  starter: { maxProducts: 20, maxLandingPages: 0 },
  pro: { maxProducts: 200, maxLandingPages: 2 },
  enterprise: { maxProducts: 1000, maxLandingPages: 50 },
};

export function EditSubscriptionModal({
  userId,
  brandName,
  email,
  subscription,
  open,
  onOpenChange,
}: EditSubscriptionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [planName, setPlanName] = useState<SubscriptionPlan>(
    subscription?.plan_name || "free_trial"
  );
  const [status, setStatus] = useState<SubscriptionStatus>(
    subscription?.status || "active"
  );
  const [maxProducts, setMaxProducts] = useState<number>(
    subscription?.max_products ?? 5
  );
  const [maxLandingPages, setMaxLandingPages] = useState<number>(
    subscription?.max_landing_pages ?? 1
  );
  
  const defaultDate = subscription?.expires_at
    ? new Date(subscription.expires_at).toISOString().split("T")[0]
    : "";
  const [expiresAt, setExpiresAt] = useState<string>(defaultDate);
  const [notes, setNotes] = useState<string>(subscription?.notes || "");

  function handlePlanChange(val: SubscriptionPlan) {
    setPlanName(val);
    const preset = PLAN_PRESETS[val];
    if (preset) {
      setMaxProducts(preset.maxProducts);
      setMaxLandingPages(preset.maxLandingPages);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formEl = e.currentTarget;
    const paymentAmount = (formEl.querySelector("#paymentAmount") as HTMLInputElement)?.value || "";
    const paymentMethod = (formEl.querySelector("#paymentMethod") as HTMLInputElement)?.value || "";

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("planName", planName);
    formData.append("status", status);
    formData.append("maxProducts", maxProducts.toString());
    formData.append("maxLandingPages", maxLandingPages.toString());
    formData.append("expiresAt", expiresAt);
    formData.append("notes", notes);
    formData.append("paymentAmount", paymentAmount);
    formData.append("paymentMethod", paymentMethod);
    formData.append("referenceNote", notes);

    const res = await updateOwnerSubscriptionAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Berhasil memperbarui paket langganan.");
      router.refresh();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMsg("");
      }, 600);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui langganan.");
    }
  }

  async function handleToggleSuspend() {
    const nextStatus: SubscriptionStatus = status === "suspended" ? "active" : "suspended";
    setLoading(true);
    setErrorMsg("");
    const res = await toggleOwnerStatusAction(userId, nextStatus);
    setLoading(false);
    if (res.success) {
      setStatus(nextStatus);
      setSuccessMsg(`Status toko diubah menjadi ${nextStatus}`);
      router.refresh();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMsg("");
      }, 600);
    } else {
      setErrorMsg(res.error || "Gagal mengubah status.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Crown className="w-4 h-4 text-purple-400" />
            Kelola Langganan Toko
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Edit kuota, paket, dan status untuk{" "}
            <span className="text-purple-300 font-semibold">{brandName}</span> ({email})
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm mt-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Paket Langganan</Label>
              <Select value={planName} onValueChange={(v) => handlePlanChange(v as SubscriptionPlan)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-9">
                  <SelectValue placeholder="Pilih Paket" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectItem value="free_trial">Free Trial (5 produk)</SelectItem>
                  <SelectItem value="starter">Starter — Rp20.000 (20 produk)</SelectItem>
                  <SelectItem value="pro">Pro — Rp165.000 (200 produk)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as SubscriptionStatus)}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Maks. Produk</Label>
              <Input
                type="number"
                value={maxProducts}
                onChange={(e) => setMaxProducts(parseInt(e.target.value, 10) || 0)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Maks. Landing Page</Label>
              <Input
                type="number"
                value={maxLandingPages}
                onChange={(e) => setMaxLandingPages(parseInt(e.target.value, 10) || 0)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                min={1}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-medium">Tanggal Expired</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-medium">Catatan Internal / Ref WA</Label>
            <Input
              type="text"
              placeholder="Misal: Konfirmasi WA a.n Budi, Transfer BCA"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white h-9"
            />
          </div>

          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-3">
            <p className="text-xs font-bold text-purple-300">Pencatatan Riwayat Pembayaran Manual (Opsional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Nominal Pembayaran (Rp)</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 165000"
                  name="paymentAmount"
                  id="paymentAmount"
                  className="bg-zinc-950 border-zinc-800 text-white h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-300 text-[11px]">Metode Pembayaran</Label>
                <Input
                  type="text"
                  defaultValue="Manual Transfer BCA"
                  name="paymentMethod"
                  id="paymentMethod"
                  className="bg-zinc-950 border-zinc-800 text-white h-8 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleSuspend}
              disabled={loading}
              size="sm"
              className={
                status === "suspended"
                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  : "border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              }
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" />
              {status === "suspended" ? "Unsuspend" : "Suspend"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Simpan
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
