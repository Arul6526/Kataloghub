import { LoginForm } from "./login-form";
import { Database, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-2">
      {/* Kolom kiri: descrripsi industrial */}
      <div className="relative hidden bg-zinc-950 text-zinc-100 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid-technical opacity-20" />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow">
              <Database className="h-5 w-5" />
            </span>
            <span className="text-sm font-bold uppercase tracking-[0.18em]">
              KatalogHub
            </span>
          </div>
        </div>
        <div className="relative space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
            Admin Console
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            Kelola katalog produk teknis &amp; CTA WhatsApp dari satu tempat.
          </h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Akses terproteksi hanya untuk admin internal.
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Data kategori, spesifikasi, dan produk tersimpan aman di Postgres + RLS.
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-zinc-500">
          © {new Date().getFullYear()} KatalogHub
        </p>
      </div>

      {/* Kolom kanan: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Masuk Admin</h1>
            <p className="text-sm text-muted-foreground">
              Gunakan email &amp; kata sandi yang terdaftar sebagai admin.
            </p>
          </div>
          <LoginForm redirectTo={redirect || "/admin"} />
        </div>
      </div>
    </main>
  );
}