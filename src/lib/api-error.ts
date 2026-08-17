import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

type APIHandler = (req: NextRequest, params?: any) => Promise<NextResponse>;

/**
 * Higher-Order Function wrapper for Next.js API Routes.
 * Catches any unhandled exceptions, logs them with logger.error, and returns a safe JSON error response.
 */
export function withErrorHandler(handler: APIHandler): APIHandler {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal server error";
      const status = error instanceof SyntaxError ? 400 : 500;

      logger.error("API", `${req.method} ${req.nextUrl.pathname} failed`, error);

      return NextResponse.json(
        { ok: false, error: message },
        { status }
      );
    }
  };
}
