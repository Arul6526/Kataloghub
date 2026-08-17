/**
 * In-memory sliding-window rate limiter.
 *
 * Cocok untuk deployment single-instance (Vercel serverless per-region).
 * Untuk production multi-instance, ganti dengan Redis-based (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  maxRequests: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Cleanup stale entries every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [, store] of stores) {
      for (const [key, entry] of store) {
        entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000); // 5 min max
        if (entry.timestamps.length === 0) store.delete(key);
      }
    }
  }, 60_000);
  // Allow process to exit without waiting for cleanup
  if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

/**
 * Create a named rate limiter instance.
 *
 * @example
 * const loginLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 * const { allowed, remaining, retryAfterMs } = loginLimiter.check("192.168.1.1");
 */
export function createRateLimiter(opts: RateLimiterOptions) {
  const id = `rl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const store = new Map<string, RateLimitEntry>();
  stores.set(id, store);
  ensureCleanup();

  return {
    /**
     * Check if a key (IP, userId, etc.) is within rate limit.
     * Each call to `check` counts as a request.
     */
    check(key: string): {
      allowed: boolean;
      remaining: number;
      retryAfterMs: number;
    } {
      const now = Date.now();
      let entry = store.get(key);

      if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
      }

      // Remove timestamps outside the current window
      entry.timestamps = entry.timestamps.filter(
        (t) => now - t < opts.windowMs
      );

      if (entry.timestamps.length >= opts.maxRequests) {
        const oldest = entry.timestamps[0];
        const retryAfterMs = oldest + opts.windowMs - now;
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: Math.max(retryAfterMs, 0),
        };
      }

      entry.timestamps.push(now);
      return {
        allowed: true,
        remaining: opts.maxRequests - entry.timestamps.length,
        retryAfterMs: 0,
      };
    },

    /** Reset the limiter for a specific key (e.g. after successful login). */
    reset(key: string) {
      store.delete(key);
    },
  };
}

// ── Pre-configured limiters for common use cases ──

/** Login: 10 attempts per minute per IP */
export const loginRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

/** Public API (order-lead, etc.): 30 requests per minute per IP */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 30,
});

/** Page tracking: 60 requests per minute per IP */
export const trackRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
});

/** Server Actions (general): 40 requests per minute per user */
export const actionRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 40,
});
