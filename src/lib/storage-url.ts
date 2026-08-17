/**
 * Helper URL publik untuk object Storage. Pure (client-safe).
 * Pisahkan dari lib/storage.ts yang menarik `next/headers`.
 */
export function publicUrl(
  bucket: "product-images" | "product-documents" | "category-media" | "landing-media" | "brand-assets",
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}