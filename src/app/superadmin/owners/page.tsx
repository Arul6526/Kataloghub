import { getStoreOwnersList } from "@/lib/actions/saas-actions";
import { OwnersTableClient } from "./owners-table-client";
import { Users } from "lucide-react";

export default async function SuperAdminOwnersPage() {
  const owners = await getStoreOwnersList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Kelola Store Owners
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Lihat, cari, filter, dan kelola paket langganan seluruh pemilik toko di platform KatalogHub.
            </p>
          </div>
        </div>
      </div>

      {/* Client Table + Filters + Modal */}
      <OwnersTableClient initialOwners={owners} />
    </div>
  );
}
