/**
 * Invitation tokens (server-only).
 *
 * The link carries 32 random bytes; the database keeps only their SHA-256.
 * A token is looked up by its hash, so the stored value is never something a
 * reader of the table could paste into a link.
 */
import { createHash, randomBytes } from "node:crypto";

/** A fresh token for an invitation link: 43 URL-safe characters. */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/** What `organization_invitations.token_hash` stores for a token. */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The shape a generated token has; anything else is not worth a query. */
export function isInviteToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

/** Lowercased and trimmed, so `Ada@Example.com ` and `ada@example.com` are one invitee. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** Deliberately loose: one `@`, something either side, a dot in the domain. */
export function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
