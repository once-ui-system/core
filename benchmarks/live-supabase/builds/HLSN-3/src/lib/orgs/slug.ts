import { randomBytes } from "node:crypto";

/** A URL slug from a name, with a random suffix so two organizations with one name never collide. */
export function makeSlug(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const suffix = randomBytes(4).toString("hex");
  return base ? `${base}-${suffix}` : `org-${suffix}`;
}

/** A random invitation token, URL-safe. */
export function makeInviteToken(): string {
  return randomBytes(24).toString("base64url");
}
