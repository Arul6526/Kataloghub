"use client";

import type { SaaSAnalyticsData } from "@/lib/actions/saas-actions";
import { TrendingUp, PieChart, Users, Zap } from "lucide-react";

export function SuperAdminAnalyticsCharts({ data }: { data: SaaSAnalyticsData }) {
  const maxCount = Math.max(...data.monthlyGrowth.map((m) => m.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 6-Month Store Registration Trend Bar Chart */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tren Pendaftaran Toko Baru</h3>
              <p className="text-[11px] text-zinc-400">Statistik pertambahan pemilik toko dalam 6 bulan terakhir</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
            6 Bulan
          </span>
        </div>

        <div className="pt-4 flex items-end justify-between gap-2 h-36 border-b border-zinc-800 pb-2">
          {data.monthlyGrowth.map((point, idx) => {
            const heightPercent = Math.max(Math.round((point.count / maxCount) * 100), 8);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {point.count}
                </div>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm transition-all duration-500 group-hover:from-purple-500 group-hover:to-blue-400"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[10px] font-mono text-zinc-400">{point.monthLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Distribution Breakdown */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Distribusi Paket</h3>
              <p className="text-[11px] text-zinc-400">Komposisi paket langganan toko</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {data.planDistribution.map((item) => {
            const planTitle =
              item.planName === "pro"
                ? "Pro Plan"
                : item.planName === "enterprise"
                ? "Enterprise"
                : "Free Trial";

            const barColor =
              item.planName === "enterprise"
                ? "bg-indigo-500"
                : item.planName === "pro"
                ? "bg-purple-500"
                : "bg-zinc-600";

            return (
              <div key={item.planName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-200">{planTitle}</span>
                  <span className="font-mono text-zinc-400 text-[11px]">
                    {item.count} toko ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
