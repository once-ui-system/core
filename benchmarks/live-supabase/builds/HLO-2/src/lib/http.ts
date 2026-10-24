import { seo } from "@/resources/once-ui.config";

// The origin the visitor used, from forwarded headers when a proxy sits in front.
export function requestOrigin(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return seo.url;
  const proto = headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// Only same-site relative paths may be used as a post-login destination.
export function safeNextPath(value: string | null | undefined, fallback = "/app"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
