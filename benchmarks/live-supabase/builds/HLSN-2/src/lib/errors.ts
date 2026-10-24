import { NextResponse } from "next/server";
import { apiErrorMessage } from "./api-error-message";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}

/** Wraps a route handler: ApiError → its status/code, anything else → 500. */
export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.status, err.code, err.message);
  }
  console.error("Unhandled API error:", err);
  return errorResponse(500, "internal_error", "An unexpected error occurred");
}

/** Codes for the statuses core's OG route handlers fail with. */
const UPSTREAM_ERROR_CODES: Record<number, string> = {
  400: "invalid_url",
  403: "forbidden",
  413: "too_large",
  415: "unsupported_type",
  500: "internal_error",
  504: "timeout",
};

/**
 * Re-shape a failure from a handler this app does not write — core's OG
 * routes answer `{ error: "…" }` — into the contract above. The status and
 * headers are kept (those errors are `no-store`); a 502, or an upstream error
 * the image proxy passes on, is `fetch_failed`. A successful response passes
 * through untouched.
 */
export async function withErrorContract(response: Response): Promise<Response> {
  if (response.ok) return response;
  const body = await response.json().catch(() => null);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-type");
  return errorResponse(
    response.status,
    UPSTREAM_ERROR_CODES[response.status] ?? "fetch_failed",
    apiErrorMessage(body, "Request failed"),
    headers,
  );
}
