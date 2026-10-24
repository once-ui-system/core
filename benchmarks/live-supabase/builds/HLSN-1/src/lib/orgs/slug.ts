import { randomBytes } from "node:crypto";

/** A slug is a URL segment: lowercase letters, digits and dashes. Matches the table's check. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/;

/**
 * A readable slug from the name plus a random suffix, so two organizations
 * with the same name never collide and the slug stays a stable URL.
 */
export function slugFor(name: string): string {
  const base =
    name
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/, "") || "org";

  return `${base}-${randomBytes(3).toString("hex")}`;
}
