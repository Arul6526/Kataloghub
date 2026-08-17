import type { PlatformAuditLog } from "@/lib/actions/saas-actions";
import { ShieldCheck, Activity, Clock, Terminal } from "lucide-react";

export function AuditLogWidget({ logs }: { logs: PlatformAuditLog[] }) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Riwayat Aktivitas System & Audit</h3>
            <p className="text-[11px] text-zinc-400">Catatan aktivitas penting operasional platform</p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
          Live Log
        </span>
      </div>

      <div className="divide-y divide-zinc-800/80">
        {logs.map((log) => (
          <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="p-1 rounded bg-zinc-800 text-zinc-300 shrink-0 mt-0.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-purple-300 text-[11px]">
                    [{log.action_type}]
                  </span>
                  <span className="text-zinc-300 font-medium truncate">
                    {log.details?.message || log.target_id || "Aktivitas Super Admin"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                  Oleh: <span className="text-zinc-400 font-mono">{log.actor_email || "System"}</span>
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-zinc-400 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {new Date(log.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
