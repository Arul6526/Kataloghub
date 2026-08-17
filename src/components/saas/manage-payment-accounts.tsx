"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlatformBankAccount } from "@/lib/db/types";
import {
  savePlatformBankAccountAction,
  deletePlatformBankAccountAction,
  updatePaymentInstructionsAction,
} from "@/lib/actions/saas-actions";
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
import {
  Building,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

interface ManagePaymentAccountsProps {
  bankAccounts: PlatformBankAccount[];
  instructions: string;
}

export function ManagePaymentAccounts({
  bankAccounts,
  instructions,
}: ManagePaymentAccountsProps) {
  const router = useRouter();

  // State for instructions text
  const [instructionText, setInstructionText] = useState(instructions);
  const [savingInstructions, setSavingInstructions] = useState(false);
  const [instructionMsg, setInstructionMsg] = useState("");

  // State for modal (add/edit bank account)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PlatformBankAccount | null>(null);

  // Form states
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("1");

  const [savingAccount, setSavingAccount] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function openAddModal() {
    setEditingAccount(null);
    setBankName("");
    setAccountNumber("");
    setAccountHolder("a.n. PT Katalog Digital Indonesia");
    setIsActive(true);
    setSortOrder((bankAccounts.length + 1).toString());
    setErrorMsg("");
    setSuccessMsg("");
    setModalOpen(true);
  }

  function openEditModal(acc: PlatformBankAccount) {
    setEditingAccount(acc);
    setBankName(acc.bank_name);
    setAccountNumber(acc.account_number);
    setAccountHolder(acc.account_holder);
    setIsActive(acc.is_active);
    setSortOrder(acc.sort_order.toString());
    setErrorMsg("");
    setSuccessMsg("");
    setModalOpen(true);
  }

  async function handleSaveAccount(e: React.FormEvent) {
    e.preventDefault();
    setSavingAccount(true);
    setErrorMsg("");
    setSuccessMsg("");

    const fd = new FormData();
    if (editingAccount) {
      fd.append("id", editingAccount.id);
    }
    fd.append("bankName", bankName);
    fd.append("accountNumber", accountNumber);
    fd.append("accountHolder", accountHolder);
    fd.append("isActive", isActive ? "true" : "false");
    fd.append("sortOrder", sortOrder);

    const res = await savePlatformBankAccountAction(fd);
    setSavingAccount(false);

    if (!res.success) {
      setErrorMsg(res.error || "Gagal menyimpan rekening bank.");
    } else {
      setSuccessMsg(
        editingAccount
          ? "Rekening bank berhasil diperbarui!"
          : "Rekening bank baru berhasil ditambahkan!"
      );
      setTimeout(() => {
        setModalOpen(false);
        router.refresh();
      }, 700);
    }
  }

  async function handleDeleteAccount(id: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus rekening ${name}?`)) return;

    setDeletingId(id);
    const res = await deletePlatformBankAccountAction(id);
    setDeletingId(null);

    if (!res.success) {
      alert(res.error || "Gagal menghapus rekening bank.");
    } else {
      router.refresh();
    }
  }

  async function handleSaveInstructions() {
    setSavingInstructions(true);
    setInstructionMsg("");

    const res = await updatePaymentInstructionsAction(instructionText);
    setSavingInstructions(false);

    if (!res.success) {
      setInstructionMsg(res.error || "Gagal memperbarui petunjuk pembayaran.");
    } else {
      setInstructionMsg("Teks petunjuk pembayaran berhasil diperbarui!");
      setTimeout(() => setInstructionMsg(""), 3000);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            Rekening Pembayaran & Petunjuk Transfer
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Atur rekening bank resmi dan pesan petunjuk transfer manual yang muncul di halaman admin berlangganan tenant.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekening
        </Button>
      </div>

      {/* Payment Instruction Description Editor */}
      <div className="space-y-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
        <Label className="text-xs font-semibold text-zinc-300">
          Teks Petunjuk Pembayaran (Sub-header)
        </Label>
        <Textarea
          value={instructionText}
          onChange={(e) => setInstructionText(e.target.value)}
          placeholder="Petunjuk transfer pembayaran..."
          rows={2}
          className="bg-zinc-900 border-zinc-700 text-white text-xs"
        />
        <div className="flex items-center justify-between">
          {instructionMsg ? (
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {instructionMsg}
            </span>
          ) : (
            <span className="text-[11px] text-zinc-400">
              Teks ini akan ditampilkan kepada pemilik toko sebelum daftar nomor rekening.
            </span>
          )}

          <Button
            onClick={handleSaveInstructions}
            disabled={savingInstructions}
            size="sm"
            variant="outline"
            className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 text-xs h-8 gap-1.5"
          >
            {savingInstructions ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Simpan Petunjuk
          </Button>
        </div>
      </div>

      {/* List of Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
              acc.is_active
                ? "bg-zinc-950/80 border-zinc-800 hover:border-zinc-700"
                : "bg-zinc-950/30 border-zinc-800/50 opacity-60"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  {acc.bank_name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    acc.is_active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {acc.is_active ? "Aktif" : "Non-Aktif"}
                </span>
              </div>

              <div>
                <p className="text-xl font-extrabold font-mono tracking-wider text-white">
                  {acc.account_number}
                </p>
                <p className="text-xs text-zinc-400">{acc.account_holder}</p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-zinc-400">
                Urutan: #{acc.sort_order}
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditModal(acc)}
                  className="h-7 px-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>

                {!acc.id.startsWith("default-") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={deletingId === acc.id}
                    onClick={() => handleDeleteAccount(acc.id, acc.bank_name)}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  >
                    {deletingId === acc.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Bank Account Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              {editingAccount ? "Edit Rekening Bank" : "Tambah Rekening Bank Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Isi informasi rekening tujuan transfer pembayaran langganan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAccount} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Bank</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Contoh: Bank BCA, Bank Mandiri, BRI, DLL"
                required
                className="bg-zinc-950 border-zinc-700 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nomor Rekening</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 8830-9128-44"
                required
                className="bg-zinc-950 border-zinc-700 text-white text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Atas Nama (A.N.)</Label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Contoh: a.n. PT Katalog Digital Indonesia"
                required
                className="bg-zinc-950 border-zinc-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Urutan Tampilan</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-zinc-950 border-zinc-700 text-white text-xs font-mono"
                  min="1"
                />
              </div>

              <div className="flex flex-col justify-end space-y-2">
                <Label className="text-xs font-semibold">Status Aktif</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                  <span className="text-xs text-zinc-300">
                    {isActive ? "Tampilkan" : "Sembunyikan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={savingAccount}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                {savingAccount ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : null}
                {editingAccount ? "Simpan Perubahan" : "Tambah Rekening"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
