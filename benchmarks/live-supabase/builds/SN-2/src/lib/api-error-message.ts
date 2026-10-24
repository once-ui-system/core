/**
 * Normalize API error bodies. Routes return either `{ error: string }` or
 * `{ error: { code, message } }` (from handleApiError) — both become a string
 * safe to show in toasts.
 */
export function apiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const error = (body as { error?: unknown }).error;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
