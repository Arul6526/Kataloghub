/**
 * Centralized structured logger for KatalogHub.
 * Provides module tagging, severity levels, and environment-aware output.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

export const logger = {
  debug: (module: string, message: string, data?: unknown) => {
    if (!shouldLog("debug")) return;
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${module}] ${message}`, data ?? "");
    }
  },

  info: (module: string, message: string, data?: unknown) => {
    if (!shouldLog("info")) return;
    console.info(`[${module}] ${message}`, data ?? "");
  },

  warn: (module: string, message: string, data?: unknown) => {
    if (!shouldLog("warn")) return;
    console.warn(`[${module}] ${message}`, data ?? "");
  },

  error: (module: string, message: string, error?: unknown, data?: unknown) => {
    if (!shouldLog("error")) return;
    const errMsg = error instanceof Error ? error.message : String(error ?? "");
    console.error(`[${module}] ${message}${errMsg ? ` — ${errMsg}` : ""}`, data ?? "");
  },
};
