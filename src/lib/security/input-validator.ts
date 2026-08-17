/**
 * Centralized input validation & sanitization helpers.
 *
 * Dipakai di API routes dan server actions untuk mencegah injection attacks.
 */

/**
 * Sanitize search input — strip characters that could break SQL LIKE/ILIKE or
 * be used for NoSQL injection.
 * Keeps alphanumeric, spaces, hyphens, dots, underscores, and common Indonesian chars.
 */
export function sanitizeSearchInput(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .trim()
    .slice(0, 200) // Hard limit on search length
    .replace(/[%_\\]/g, "") // Strip SQL LIKE wildcards and backslash
    .replace(/[<>"'`;]/g, "") // Strip HTML/SQL special chars
    .replace(/[\x00-\x1f]/g, ""); // Strip control characters
}

/**
 * Escape characters special to PostgreSQL LIKE/ILIKE patterns.
 * Use this when you *intentionally* want to search for literal text containing % or _.
 *
 * @example
 * const safeSearch = escapeForLike("100% cotton");
 * // → "100\\% cotton" — will match literal "100% cotton"
 */
export function escapeForLike(input: string): string {
  return input.replace(/[%_\\]/g, (char) => `\\${char}`);
}

/**
 * Validate and clamp pagination parameters to safe ranges.
 */
export function validatePagination(
  limit?: number | string | null,
  offset?: number | string | null,
): { limit: number; offset: number } {
  const MAX_LIMIT = 100;
  const DEFAULT_LIMIT = 20;

  let parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : (limit ?? DEFAULT_LIMIT);
  let parsedOffset = typeof offset === "string" ? parseInt(offset, 10) : (offset ?? 0);

  if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = DEFAULT_LIMIT;
  if (parsedLimit > MAX_LIMIT) parsedLimit = MAX_LIMIT;

  if (isNaN(parsedOffset) || parsedOffset < 0) parsedOffset = 0;

  return { limit: parsedLimit, offset: parsedOffset };
}

/**
 * Validate that a string looks like a safe slug (letters, numbers, hyphens only).
 */
export function isValidSlug(input: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,180}$/.test(input);
}

/**
 * Validate and sanitize a store slug from user input.
 * Returns null if invalid.
 */
export function sanitizeSlug(input: string | undefined | null): string | null {
  if (!input) return null;
  const clean = input.trim().toLowerCase().slice(0, 180);
  return isValidSlug(clean) ? clean : null;
}

/**
 * Sanitize a plain text string for safe storage (strip control chars, limit length).
 */
export function sanitizeText(
  input: string | undefined | null,
  maxLength: number = 1000,
): string {
  if (!input) return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ""); // Keep \t \n \r
}

/**
 * Validate that a value is a valid UUID v4 format.
 */
export function isValidUUID(input: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
}

/**
 * Validate JSON payload size (in bytes) to prevent oversized payloads.
 */
export function isPayloadTooLarge(body: unknown, maxBytes: number = 50_000): boolean {
  try {
    const str = typeof body === "string" ? body : JSON.stringify(body);
    return new TextEncoder().encode(str).length > maxBytes;
  } catch {
    return true; // If we can't serialize, consider it too large
  }
}

/**
 * Extract client IP from request headers (safe for rate limiting).
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headers.get("x-real-ip") || "unknown";
}
