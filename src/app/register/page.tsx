import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { Database, CheckCircle2, Sparkles } from "lucide-react";
import { RegisterForm } from "./register-form";
import { AuthBrandingShowcase } from "@/components/auth/auth-branding-showcase";
import { ThemeToggle } from "@/components/theme-toggle";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Daftar - KatalogHub",
  description: "Buat website katalog untuk bisnis Anda sekarang.",
};

export default function RegisterPage() {
  return (
    <div
      className={`flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:overflow-hidden ${spaceGrotesk.variable}`}
    >
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background px-6 sm:px-10">
        <Link
          href="/promo"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="shadow-xs flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Database className="h-4 w-4" />
          </span>
          <span
            className={`font-space font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}
          >
            Katalog<span className="text-primary">Hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
      </header>

      <main className="grid flex-1 overflow-hidden lg:grid-cols-2">
        {/* Left Side: Form */}
        <div className="flex flex-col items-center justify-center overflow-y-auto bg-background p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Setup toko tanpa ribet
              </div>
              <h1 className="font-space text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Jadikan bisnis Anda mudah ditemukan.
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Buat akun, pilih paket, lalu bangun etalase digital yang siap menampilkan produk dan
                menerima order WhatsApp.
              </p>
              <div className="grid gap-2 pt-1 text-xs font-medium text-muted-foreground sm:grid-cols-2">
                {[
                  "Katalog online dalam hitungan menit",
                  "Order langsung ke WhatsApp Anda",
                  "Bisa dimulai gratis",
                  "AI Team siap membantu bisnis",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {item}
                  </span>
                ))}
              </div>
            </div>

            <RegisterForm />

            <div className="border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
              Dengan mendaftar, Anda siap membawa toko ke layar pelanggan. Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Masuk
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Copywriting & Branding Showcase */}
        <AuthBrandingShowcase mode="register" />
      </main>
    </div>
  );
}
