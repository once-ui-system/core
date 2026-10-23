/**
 * Where to go after signing in. Client-safe.
 *
 * `/auth?next=/invite/…` sends someone back to the page that asked them to
 * sign in. Only a same-site path is honoured: an absolute URL, a
 * protocol-relative `//host` or a backslash trick would make the sign-in page
 * an open redirect, so anything that is not a plain `/path` falls back.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/app"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

/** The `next` parameter of the current page, read without `useSearchParams`. */
export function nextFromLocation(fallback = "/app"): string {
  if (typeof window === "undefined") return fallback;
  return safeNextPath(new URLSearchParams(window.location.search).get("next"), fallback);
}
