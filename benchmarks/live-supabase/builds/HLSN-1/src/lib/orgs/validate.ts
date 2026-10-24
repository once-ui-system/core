import { isInvitableRole, type InvitableRole } from "./roles";

/** An organization name: trimmed, 1 to 80 characters. */
export function parseName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length >= 1 && name.length <= 80 ? name : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An optional email for an invitation: null when absent, false when malformed. */
export function parseInviteEmail(value: unknown): string | null | false {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return false;
  const email = value.trim().toLowerCase();
  return EMAIL.test(email) && email.length <= 254 ? email : false;
}

export function parseInvitableRole(value: unknown): InvitableRole | null {
  return isInvitableRole(value) ? value : null;
}
