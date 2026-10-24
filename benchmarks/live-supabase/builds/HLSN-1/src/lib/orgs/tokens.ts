import { createHash, randomBytes } from "node:crypto";

/** Invitations last seven days from creation. */
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** A random invitation token, URL-safe. Only its SHA-256 is stored. */
export function newInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
