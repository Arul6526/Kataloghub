"use client";

import { useState } from "react";
import type { SubscriptionPlanConfig, PlatformBankAccount } from "@/lib/db/types";
import { EditPlanModal } from "@/components/saas/edit-plan-modal";
import { ManagePaymentAccounts } from "@/components/saas/manage-payment-accounts";
import { Button } from "@/components/ui/button";
import { Package, FileCode, Crown, Sparkles, Clock, Edit3, Check } from "lucide-react";

interface SubscriptionsClientViewProps {
  plans: SubscriptionPlanConfig[];
  bankAccounts: PlatformBankAccount[];
  instructions: string;
}

export function SubscriptionsClientView({
  plans,
  bankAccounts,
  instructions,
}: SubscriptionsClientViewProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isPro = plan.slug === "pro";
          const isEnterprise = plan.slug === "enterprise";

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-zinc-900 border ${
                isPro
                  ? "border-purple-500/40 ring-1 ring-purple-500/20"
                  : isEnterprise
                  ? "border-indigo-500/40"
                  : "border-zinc-800"
              } p-6 flex flex-col hover:border-zinc-700 transition-all duration-200 group`}
            >
              {plan.is_popular && (
                <div className="absolute -top-2.5 left-5">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                    REKOMENDASI (POPULER)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isPro
                        ? "bg-purple-500/10 text-purple-400"
                        : isEnterprise
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isPro ? (
                      <Crown className="w-5 h-5" />
                    ) : isEnterprise ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-zinc-100">{plan.name}</h2>
                    <p className="text-[11px] font-mono text-zinc-400">slug: {plan.slug}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setModalOpen(true);
                  }}
                  className="bg-zinc-950 border-zinc-700 text-purple-300 hover:text-white hover:bg-purple-600/20 text-xs h-8"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Paket
                </Button>
              </div>

              <div className="mb-5">
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {plan.price_label || (plan.price > 0 ? `Rp${plan.price.toLocaleString("id-ID")}` : "Gratis")}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Periode: <span className="text-zinc-200 font-semibold">{plan.billing_period}</span> ({plan.duration_days} hari)
                </div>
              </div>

              <div className="space-y-2 flex-1 mb-5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Package className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kuota Produk: <strong className="text-white">{plan.max_products}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Kuota Custom LP: <strong className="text-white">{plan.max_landing_pages}</strong></span>
                </div>
              </div>

              <div className="border-t border-zinc-800/80 pt-4">
                <p className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
                  Ketentuan Fitur Paket:
                </p>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Manajemen Rekening Bank Platform */}
      <ManagePaymentAccounts
        bankAccounts={bankAccounts}
        instructions={instructions}
      />

      {selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
