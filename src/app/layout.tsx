import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalyticsTracker } from "@/components/public/analytics-tracker";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { IframeDetector } from "@/components/iframe-detector";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
  fallback: ["Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "Katalog Produk",
    template: "%s · KatalogHub",
  },
  description: "Katalog produk teknis dengan spesifikasi lengkap.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="kataloghub-theme">
          <IframeDetector />
          <AnalyticsTracker />
          <PwaInstallPrompt />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
