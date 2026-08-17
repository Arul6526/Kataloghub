import { NextResponse } from "next/server";

export type APIErrorResponse = {
  ok: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type APISuccessResponse<T = unknown> = {
  ok: true;
  data: T;
};

export type APIResponse<T = unknown> = APISuccessResponse<T> | APIErrorResponse;

export function apiError(
  error: string,
  status: number = 400,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    { ok: false, error, code, details },
    { status }
  );
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<APISuccessResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}
