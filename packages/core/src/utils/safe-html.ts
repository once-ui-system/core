/**
 * Escapes HTML special characters for safe insertion into HTML text nodes
 * or attributes when content is not already sanitized HTML.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Serializes a value for safe embedding inside HTML <script> tags.
 * JSON.stringify escapes quotes and backslashes but not `<`, which allows
 * `</script>` breakout when prop values are attacker-controlled.
 */
export function safeScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const ALLOWED_HREF_SCHEMES = new Set(["http", "https", "mailto", "tel", "sms"]);

/**
 * Returns a trimmed href when it is safe to use as a navigation target,
 * otherwise `undefined`. Blocks `javascript:`, `data:`, and other non-allowlisted
 * schemes (including variants with embedded whitespace/control characters).
 * Scheme-less values (relative paths, `#hash`, `?query`) are allowed.
 */
export function sanitizeHref(href: string | null | undefined): string | undefined {
  if (href == null) return undefined;

  const trimmed = href.trim();
  if (!trimmed) return undefined;

  const forScheme = trimmed.replace(/[\u0000-\u001F\u007F\s]/g, "");
  const schemeMatch = forScheme.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();
    if (!ALLOWED_HREF_SCHEMES.has(scheme)) return undefined;
  }

  return trimmed;
}
