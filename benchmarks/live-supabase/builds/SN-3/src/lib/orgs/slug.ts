/**
 * Slug rules for organizations. Client-safe.
 *
 * Organizations are addressed by slug, not by UUID: under `/app/` nothing
 * else can land, so the `isUuid(segment)` shape check Aveiro needs at the
 * URL root is not load-bearing here and slugs are free.
 *
 * ORG_SLUG_PATTERN MUST stay identical to the `organizations_slug_shape`
 * check constraint in supabase/orgs.sql. The database enforces it so a
 * direct insert cannot produce a tenant its own routes cannot address; this
 * copy exists so the API can refuse one with a 400 instead of a 500.
 */

/** Lowercase, digits and dashes; 2–63 characters; no leading dash. */
export const ORG_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;

export const ORG_SLUG_MIN_LENGTH = 2;
export const ORG_SLUG_MAX_LENGTH = 63;

export function isOrgSlug(value: unknown): value is string {
  return typeof value === "string" && ORG_SLUG_PATTERN.test(value);
}

/**
 * Best-effort slug from arbitrary text — a name typed into a form, or the
 * local part of an email address. Returns "" when nothing usable survives,
 * which the caller handles rather than shipping an unaddressable tenant.
 *
 * Accents are folded rather than dropped, so "Añejo" becomes "anejo" and not
 * "a-ejo". Trailing dashes are trimmed: the check constraint would accept
 * one, but it reads as a typo in a URL.
 */
export function slugify(input: string): string {
  // NFKD splits an accented letter into base + combining mark; \p{M} then
  // drops the marks. The Unicode property rather than a ̀-ͯ range,
  // so Greek, Cyrillic and Vietnamese diacritics fold too.
  const folded = input.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();

  const slug = folded
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ORG_SLUG_MAX_LENGTH)
    .replace(/-+$/, "");

  return slug.length >= ORG_SLUG_MIN_LENGTH ? slug : "";
}

/**
 * `slugify` with a suffix appended, keeping the whole inside the length
 * limit — how a slug collision is resolved when a personal organization is
 * created for the second "alex@…" to sign up.
 */
export function slugWithSuffix(base: string, suffix: string): string {
  const room = ORG_SLUG_MAX_LENGTH - suffix.length - 1;
  const trimmed = base.slice(0, Math.max(1, room)).replace(/-+$/, "");
  return `${trimmed}-${suffix}`;
}
