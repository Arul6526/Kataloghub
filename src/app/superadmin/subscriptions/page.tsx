import { requireSuperAdmin } from "@/lib/auth";
import { getSubscriptionPlans, getAllPlatformBankAccounts } from "@/lib/actions/saas-actions";
import { SubscriptionsClientView } from "./subscriptions-client";
import { CreditCard, Sparkles } from "lucide-react";

export default async function SubscriptionsPage() {
  await requireSuperAdmin();
  const plans = await getSubscriptionPlans();
  const paymentSettings = await getAllPlatformBankAccounts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                Kelola Paket Langganan SaaS
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Super Admin dapat mengubah harga, durasi masa aktif (misal 3 bulan / 1 tahun), kuota produk, dan daftar fitur paket langganan secara fleksibel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Client View */}
      <SubscriptionsClientView
        plans={plans}
        bankAccounts={paymentSettings.bankAccounts}
        instructions={paymentSettings.instructions}
      />

      {/* Info Note */}
      <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 p-4 text-xs text-slate-400">
        <p className="flex items-center gap-2 text-purple-300 font-semibold mb-1">
          <Sparkles className="w-4 h-4" /> Pengaturan Otomatis Pendaftaran:
        </p>
        <p>
          Setiap pemilik toko baru yang mendaftar akan secara otomatis mendapatkan paket <span className="font-semibold text-white">Free Trial</span> dengan durasi masa aktif dan kuota yang telah Anda tentukan di atas (Default: <span className="text-emerald-400 font-semibold">90 Hari / 3 Bulan</span>).
        </p>
      </div>
    </div>
  );
}
