import { createClient } from "@/lib/supabase/server";
import { BootstrapForm } from "./bootstrap-form";
import { Database, Rocket } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Halaman bootstrap admin pertama.
 * Hanya bisa dipakai bila belum ada admin sama sekali (has_no_admin() = true).
 */
export default async function BootstrapPage() {
  const supabase = await createClient();

  // Cek apakah sudah ada admin
  const { data } = await supabase.rpc("has_no_admin").single();
  const noAdmin = Boolean(data);

  // Sudah ada admin -> redirect ke login
  if (!noAdmin) {
    redirect("/admin/login");
  }

  return (
    <main className="relative min-h-dvh bg-grid-technical">
      <div className="container flex min-h-dvh max-w-md flex-col items-center justify-center py-12">
        <div className="w-full space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Rocket className="h-6 w-6" />
            </span>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Bootstrap Admin</h1>
              <p className="text-sm text-muted-foreground">
                Buat akun admin pertama untuk mulai mengelola katalog.
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <BootstrapForm />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Setelah admin pertama dibuat, halaman ini otomatis dinonaktifkan.
            <br />
            <Link href="/admin/login" className="font-medium text-primary hover:underline">
              Saya sudah punya akun admin →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}