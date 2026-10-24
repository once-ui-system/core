/**
 * Invitations (server-only).
 *
 * An admin creates an invitation for an optional email address and a role.
 * The response carries the link's token once; only its SHA-256 is stored. The
 * app sends no email: the admin copies the link.
 *
 * Accepting: a signed-in user who holds a live token joins the organization
 * with the invitation's role. A token is single-use and expires after seven
 * days.
 */
import type { ServiceClient } from "@/lib/sb/service";
import {
  type AdmittedOrg,
  type OrgGuardFailure,
  ensureMembership,
  resolveUserAndService,
} from "./server";
import { generateInviteToken, hashInviteToken, isEmail, isInviteToken, normalizeEmail } from "./token";
import { type OrgInvitation, type OrgRole, asRole } from "./types";

const INVITATION_COLUMNS = "id, email, role, created_at, expires_at";

/** Postgres unique-violation. */
const UNIQUE_VIOLATION = "23505";

/** Open invitations: not accepted, not revoked, not expired. */
export async function listInvitations(
  admitted: AdmittedOrg,
): Promise<{ ok: true; invitations: OrgInvitation[] } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organization_invitations")
    .select(INVITATION_COLUMNS)
    .eq("organization_id", admitted.org.id)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) return { ok: false, status: 500, error: "Failed to load the invitations" };
  return { ok: true, invitations: (data ?? []) as unknown as OrgInvitation[] };
}

/**
 * Create an invitation. `email` is optional; when given, an open invitation
 * already for that address is revoked first, so re-inviting replaces it.
 * Nobody is invited as an owner: ownership changes hands inside the
 * organization, never through a link.
 */
export async function createInvitation(
  admitted: AdmittedOrg,
  emailInput: unknown,
  roleInput: unknown,
): Promise<{ ok: true; invitation: OrgInvitation; token: string } | OrgGuardFailure> {
  let email: string | null = null;
  if (emailInput !== undefined && emailInput !== null && emailInput !== "") {
    if (!isEmail(emailInput)) return { ok: false, status: 400, error: "Enter a valid email address" };
    email = normalizeEmail(emailInput);
  }

  const role = asRole(roleInput ?? "member");
  if (role !== "admin" && role !== "member") {
    return { ok: false, status: 400, error: 'Role must be "admin" or "member"' };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  if (email) {
    await auth.service
      .from("organization_invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("organization_id", admitted.org.id)
      .eq("email", email)
      .is("accepted_at", null)
      .is("revoked_at", null);
  }

  const token = generateInviteToken();
  const { data, error } = await auth.service
    .from("organization_invitations")
    .insert({
      organization_id: admitted.org.id,
      email,
      role,
      token_hash: hashInviteToken(token),
      invited_by: admitted.userId,
    })
    .select(INVITATION_COLUMNS)
    .maybeSingle();

  if (error?.code === UNIQUE_VIOLATION) {
    return { ok: false, status: 409, error: "That address was just invited" };
  }
  if (error || !data) return { ok: false, status: 500, error: "Failed to create the invitation" };

  return { ok: true, invitation: data as unknown as OrgInvitation, token };
}

/** Revoke an open invitation of an organization the caller administers. */
export async function revokeInvitation(
  admitted: AdmittedOrg,
  invitationId: string,
): Promise<{ ok: true } | OrgGuardFailure> {
  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const { data, error } = await auth.service
    .from("organization_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitationId)
    .eq("organization_id", admitted.org.id)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .select("id");

  if (error && error.code !== "22P02") {
    return { ok: false, status: 500, error: "Failed to revoke the invitation" };
  }
  if (!data || data.length === 0) return { ok: false, status: 404, error: "Invitation not found" };
  return { ok: true };
}

type InvitationRow = {
  id: string;
  organization_id: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

/** One answer for every way a link can be dead, so a probe learns nothing. */
const DEAD_LINK: OrgGuardFailure = {
  ok: false,
  status: 404,
  error: "This invitation link is invalid or has expired",
};

async function findOpenInvitation(
  service: ServiceClient,
  token: string,
): Promise<InvitationRow | null> {
  const { data } = await service
    .from("organization_invitations")
    .select("id, organization_id, role, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  const row = data as unknown as InvitationRow | null;
  if (!row || row.accepted_at || row.revoked_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  return row;
}

/** What the invite page shows: the organization and the role the link grants. */
export interface InvitationPreview {
  organization: { name: string; slug: string };
  role: Exclude<OrgRole, "owner">;
}

/** A live invitation, for a signed-in visitor. */
export async function previewInvitation(
  token: string,
): Promise<{ ok: true; preview: InvitationPreview } | OrgGuardFailure> {
  if (!isInviteToken(token)) return DEAD_LINK;

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const row = await findOpenInvitation(auth.service, token);
  if (!row) return DEAD_LINK;

  const { data: org } = await auth.service
    .from("organizations")
    .select("name, slug")
    .eq("id", row.organization_id)
    .maybeSingle();
  if (!org) return DEAD_LINK;

  const { name, slug } = org as unknown as { name: string; slug: string };
  return {
    ok: true,
    preview: { organization: { name, slug }, role: row.role === "admin" ? "admin" : "member" },
  };
}

/**
 * Accept an invitation: claim it, then join the organization with its role.
 * The claim is conditional, so two concurrent accepts of one link cannot both
 * succeed. Someone already a member keeps the role they have.
 */
export async function acceptInvitation(
  token: string,
): Promise<{ ok: true; organization: { name: string; slug: string } } | OrgGuardFailure> {
  if (!isInviteToken(token)) return DEAD_LINK;

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const row = await findOpenInvitation(auth.service, token);
  if (!row) return DEAD_LINK;

  const { data: claimed, error: claimError } = await auth.service
    .from("organization_invitations")
    .update({ accepted_at: new Date().toISOString(), accepted_by: auth.userId })
    .eq("id", row.id)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .select("id");
  if (claimError) return { ok: false, status: 500, error: "Failed to accept the invitation" };
  if (!claimed || claimed.length === 0) return DEAD_LINK;

  const role = row.role === "admin" ? "admin" : "member";
  const joined = await ensureMembership(auth.service, row.organization_id, auth.userId, role, auth.email);
  if (!joined.ok) return joined;

  const { data: org } = await auth.service
    .from("organizations")
    .select("name, slug")
    .eq("id", row.organization_id)
    .maybeSingle();
  if (!org) return DEAD_LINK;

  return { ok: true, organization: org as unknown as { name: string; slug: string } };
}
