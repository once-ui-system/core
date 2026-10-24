/**
 * The local path a sign-in should return to. Only same-origin paths pass, so a
 * crafted `next` cannot send the visitor to another site.
 */
export function safeNext(value: string | null | undefined, fallback = "/app"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
