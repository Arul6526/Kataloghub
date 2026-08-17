import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { Database, ArrowLeft } from "lucide-react";
import { LoginFormPlatform } from "./login-form-platform";
import { AuthBrandingShowcase } from "@/components/auth/auth-branding-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Masuk - KatalogHub",
  description: "Masuk ke dashboard KatalogHub Anda.",
};

export default function LoginPage() {
  return (
    <div className={`min-h-screen lg:h-screen lg:overflow-hidden bg-background text-foreground flex flex-col ${spaceGrotesk.variable}`}>
      <header className="h-16 shrink-0 px-6 sm:px-10 flex justify-between items-center z-20 border-b border-border/40 bg-background">
        <Link href="/promo" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Database className="h-4 w-4" />
          </span>
          <span className={`font-space font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
            Katalog<span className="text-primary">Hub</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/promo" className="text-xs font-mono flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 grid lg:grid-cols-2 overflow-hidden">
        {/* Left Side: Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 overflow-y-auto bg-background">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <h1 className="font-space text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Selamat Datang
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Masuk ke Dasbor KatalogHub untuk mengelola produk dan pesanan bisnis Anda dengan mudah.
              </p>
            </div>

            <LoginFormPlatform />

            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
              Belum punya katalog?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Copywriting & Branding Showcase */}
        <AuthBrandingShowcase mode="login" />
      </main>
    </div>
  );
}
