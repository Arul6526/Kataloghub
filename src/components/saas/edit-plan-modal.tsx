"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlanConfig } from "@/lib/db/types";
import { updateSubscriptionPlanAction } from "@/lib/actions/saas-actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit3, CheckCircle2, Loader2 } from "lucide-react";

interface EditPlanModalProps {
  plan: SubscriptionPlanConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanModal({ plan, open, onOpenChange }: EditPlanModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price.toString());
  const [priceLabel, setPriceLabel] = useState(plan.price_label || "");
  const [billingPeriod, setBillingPeriod] = useState(plan.billing_period);
  const [durationDays, setDurationDays] = useState(plan.duration_days.toString());
  const [maxProducts, setMaxProducts] = useState(plan.max_products.toString());
  const [maxLandingPages, setMaxLandingPages] = useState(plan.max_landing_pages.toString());
  const [features, setFeatures] = useState(plan.features.join("\n"));
  const [isActive, setIsActive] = useState(plan.is_active);
  const [isPopular, setIsPopular] = useState(plan.is_popular);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("id", plan.id);
    formData.append("slug", plan.slug);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("priceLabel", priceLabel);
    formData.append("billingPeriod", billingPeriod);
    formData.append("durationDays", durationDays);
    formData.append("maxProducts", maxProducts);
    formData.append("maxLandingPages", maxLandingPages);
    formData.append("features", features);
    formData.append("isActive", isActive ? "true" : "false");
    formData.append("isPopular", isPopular ? "true" : "false");

    const res = await updateSubscriptionPlanAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccessMsg("Paket berhasil diperbarui.");
      router.refresh();
      setTimeout(() => {
        onOpenChange(false);
        setSuccessMsg("");
      }, 600);
    } else {
      setErrorMsg(res.error || "Gagal memperbarui paket.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-white">
            <Edit3 className="w-4 h-4 text-purple-400" />
            Edit Setting Paket: {plan.name}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Ubah harga, durasi masa aktif, kuota produk, dan daftar fitur paket langganan ini.
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
              <Label className="text-slate-300 text-xs font-medium">Nama Paket</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Label Harga Tampilan</Label>
              <Input
                type="text"
                placeholder="Misal: Gratis / Rp165.000"
                value={priceLabel}
                onChange={(e) => setPriceLabel(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Harga Angka (IDR)</Label>
              <Input
                type="number"
                placeholder="0 / 165000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Periode Tampilan</Label>
              <Input
                type="text"
                placeholder="3 bulan / per tahun"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Durasi (Hari)</Label>
              <Input
                type="number"
                placeholder="90 / 365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                min={1}
              />
              <p className="text-[10px] text-slate-400">90 = 3 bulan, 365 = 1 thn</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Maks. Produk</Label>
              <Input
                type="number"
                value={maxProducts}
                onChange={(e) => setMaxProducts(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                min={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-xs font-medium">Maks. Landing Page</Label>
              <Input
                type="number"
                value={maxLandingPages}
                onChange={(e) => setMaxLandingPages(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white h-9"
                min={1}
              />
            </div>
          </div>

          {/* Features list text area */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-medium">
              Fitur Paket (Pisahkan Setiap Poin Dengan Baris Baru / Enter)
            </Label>
            <Textarea
              rows={5}
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white text-xs leading-relaxed"
              placeholder={"Katalog online publik\n5 produk\n1 custom landing page"}
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="is-active-switch" />
              <Label htmlFor="is-active-switch" className="text-xs text-slate-300 cursor-pointer">
                Paket Aktif
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isPopular} onCheckedChange={setIsPopular} id="is-popular-switch" />
              <Label htmlFor="is-popular-switch" className="text-xs text-slate-300 cursor-pointer">
                Badge &quot;POPULER&quot;
              </Label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
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
              Simpan Perubahan Paket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
