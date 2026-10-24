import { randomBytes } from "node:crypto";

/** "Team Alpha" -> "team-alpha-3f9c". The suffix keeps slugs unique and avoids route names. */
export function makeSlug(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return `${base || "org"}-${randomBytes(2).toString("hex")}`;
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}
