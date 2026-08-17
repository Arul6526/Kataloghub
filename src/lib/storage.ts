import { createClient } from "@/lib/supabase/server";
import { publicUrl } from "@/lib/storage-url";
import { getCurrentUser } from "@/lib/auth";

type Bucket = "product-images" | "product-documents" | "category-media" | "landing-media" | "brand-assets";

// ── File Type Whitelist per Bucket ──
const ALLOWED_MIME_TYPES: Record<Bucket, Set<string>> = {
  "product-images": new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  ]),
  "product-documents": new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "image/jpeg", "image/png", "image/webp",
  ]),
  "category-media": new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
  ]),
  "landing-media": new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    "video/mp4", "video/webm",
  ]),
  "brand-assets": new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    "image/x-icon", "image/vnd.microsoft.icon",
  ]),
};

// ── Max File Size per Bucket (in bytes) ──
const MAX_FILE_SIZE: Record<Bucket, number> = {
  "product-images": 5 * 1024 * 1024,     // 5 MB
  "product-documents": 10 * 1024 * 1024,  // 10 MB
  "category-media": 5 * 1024 * 1024,      // 5 MB
  "landing-media": 10 * 1024 * 1024,      // 10 MB
  "brand-assets": 2 * 1024 * 1024,        // 2 MB
};

// ── Dangerous File Extension Blocklist ──
const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".pif",
  ".js", ".vbs", ".wsf", ".ps1", ".sh", ".bash",
  ".php", ".asp", ".aspx", ".jsp", ".cgi",
  ".html", ".htm", ".svg", // SVG allowed by MIME type check above, block renamed files
]);

/**
 * Validate file before upload — checks MIME type, extension, and size.
 */
function validateFile(bucket: Bucket, file: File): string | null {
  // 1. Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[bucket];
  if (!allowedTypes || !allowedTypes.has(file.type)) {
    return `Tipe file "${file.type || "unknown"}" tidak diizinkan untuk bucket ${bucket}. Gunakan: ${Array.from(allowedTypes).join(", ")}`;
  }

  // 2. Check file size
  const maxSize = MAX_FILE_SIZE[bucket];
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maksimal ${maxMB} MB.`;
  }

  // 3. Check file extension (defense-in-depth)
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return `Ekstensi file "${ext}" tidak diizinkan.`;
  }

  return null; // Valid
}

/**
 * Upload file ke bucket Supabase Storage dan kembalikan path publik.
 * Path menggunakan prefix user_id untuk tenant isolation.
 *
 * SECURITY:
 * - File type whitelist per bucket
 * - File size limit per bucket
 * - Tenant-isolated paths via user_id prefix
 * - Dangerous extension blocklist
 */
export async function uploadFile(
  bucket: Bucket,
  file: File,
  prefix = "",
): Promise<{ path: string; size: number; mime: string }> {
  // Validate file first
  const validationError = validateFile(bucket, file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = await createClient();

  // Get current user for tenant-isolated path
  const user = await getCurrentUser();
  const userPrefix = user?.userId ? `${user.userId.substring(0, 8)}` : "anon";

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const random = Math.random().toString(36).slice(2, 10);
  const objectPath = `${userPrefix}/${yyyy}/${mm}/${prefix ? prefix + "-" : ""}${random}-${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal upload ke ${bucket}: ${error.message}`);
  }

  return { path: objectPath, size: file.size, mime: file.type };
}

/**
 * Hapus object di storage. Aman jika path null (no-op).
 */
export async function removeFile(bucket: Bucket, path: string | null | undefined) {
  if (!path) return;
  if (path.startsWith("http://") || path.startsWith("https://")) return;
  
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([path]);
}

/**
 * URL publik object storage (untuk display gambar).
 * Di-re-export dari storage-url.ts (client-safe).
 */
export { publicUrl };

/**
 * URL unduhan bertanda (签名 url) untuk dokumen — publik bucket tetap aman pakai ini.
 */
export async function signedDownloadUrl(
  bucket: Bucket,
  path: string,
  expiresInSec = 60,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSec);
  if (error || !data) return null;
  return data.signedUrl;
}