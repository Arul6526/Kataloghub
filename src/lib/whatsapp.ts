import type { SiteSettings } from "@/lib/db/types";

/**
 * Format nomor HP ke format internasional WhatsApp (tanpa "+", diawali "62").
 * Contoh:
 * - "081234567890"   -> "6281234567890"
 * - "+6281234567890" -> "6281234567890"
 * - "81234567890"    -> "6281234567890"
 * - "6281234567890"   -> "6281234567890"
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Bangun URL wa.me dari nomor & template pesan.
 */
export function buildWhatsAppUrl(
  settings: Pick<SiteSettings, "whatsapp_number" | "whatsapp_template"> | null,
  productName?: string,
): string | null {
  if (!settings?.whatsapp_number || !settings?.whatsapp_template) return null;
  const cleanNumber = formatWhatsAppNumber(settings.whatsapp_number);
  if (!cleanNumber) return null;

  const message = productName
    ? settings.whatsapp_template.replace(/\[nama produk\]/gi, productName)
    : settings.whatsapp_template;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Nomor WhatsApp Admin Platform KatalogHub.
 * Dapat diatur melalui `.env.local` dengan key `NEXT_PUBLIC_ADMIN_WA`.
 */
export const PLATFORM_ADMIN_WA = formatWhatsAppNumber(process.env.NEXT_PUBLIC_ADMIN_WA || "628123456789");

/**
 * Validator ringan nomor WhatsApp internasional.
 */
export function isValidWhatsAppNumber(value: string): boolean {
  const formatted = formatWhatsAppNumber(value);
  return /^\d{10,15}$/.test(formatted);
}