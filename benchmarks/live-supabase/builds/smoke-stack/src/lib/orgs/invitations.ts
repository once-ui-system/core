/**
 * Invitations (server-only).
 *
 * An admin invites an email address with a role; the response carries a link
 * once, and only the token's hash is kept. Stack sends no email: the admin
 * copies the link, or the app wires `createInvitation` to its own mailer —
 * an email provider is a recurring cost and a choice the template does not
 * make for you.
 *
 * Accepting asks two things, and both must hold: the link is a live
 * invitation, and the signed-in user's verified email is the address it was
 * sent to. The second is what makes a forwarded or leaked link worthless.
 */
import type { ServiceClient } from "@/lib/sb/service";
import {
  type AdmittedOrg,
  type OrgGuardFailure,
  asRole,
  ensureMembership,
  resolveUserAndService,
} from "./server";
import { generateInviteToken, hashInviteToken, isEmail, isInviteToken, normalizeEmail } from "./token";
import type { OrgInvitation, OrgRole, Organization } from "./types";

const INVITATION_COLUMNS = "id, email, role, created_at, expires_at";

/** Postgres unique-violation. */
const UNIQUE_VIOLATION = "23505";

export { invitationPathFor as invitationPath } from "./types";

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
 * Invite an address, replacing any open invitation it already has — so
 * "resend" is the same call and the old link stops working.
 *
 * An admin may invite admins and members; nobody is invited as an owner (see
 * `setOrgMemberRole` for how ownership changes hands).
 */
export async function createInvitation(
  admitted: AdmittedOrg,
  emailInput: unknown,
  roleInput: unknown,
): Promise<{ ok: true; invitation: OrgInvitation; token: string } | OrgGuardFailure> {
  if (!isEmail(emailInput)) return { ok: false, status: 400, error: "Enter a valid email address" };
  const role = asRole(roleInput ?? "member");
  if (role !== "admin" && role !== "member") {
    return { ok: false, status: 400, error: 'Role must be "admin" or "member"' };
  }
  if (admitted.org.personal) {
    return {
      ok: false,
      status: 409,
      error: "A personal organization is just for you. Create an organization to invite people.",
    };
  }

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const email = normalizeEmail(emailInput);

  const { count } = await auth.service
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", admitted.org.id)
    .eq("email", email);
  if ((count ?? 0) > 0) return { ok: false, status: 409, error: "That person is already a member" };

  // Replace, don't stack: revoke what is open for this address first.
  await auth.service
    .from("organization_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("organization_id", admitted.org.id)
    .eq("email", email)
    .is("accepted_at", null)
    .is("revoked_at", null);

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
    // A concurrent invite for the same address won the race; theirs stands.
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

  // Scoped by the guard's organization, so an id from another tenant matches
  // nothing and reads as a miss.
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
  email: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

/** What the invite page shows before anyone accepts. */
export interface InvitationPreview {
  organization: Pick<Organization, "name" | "slug">;
  role: Exclude<OrgRole, "owner">;
  email: string;
  /** Whether the signed-in user (if any) is the one it was sent to. */
  forYou: boolean;
  signedIn: boolean;
}

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
    .select("id, organization_id, email, role, expires_at, accepted_at, revoked_at")
    .eq("token_hash", hashInviteToken(token))
    .maybeSingle();

  const row = data as unknown as InvitationRow | null;
  if (!row || row.accepted_at || row.revoked_at) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) return null;
  return row;
}

/**
 * The invite page's read: which organization, which role, and whether the
 * caller is the invitee. Signed-out callers get a 401 — the link alone shows
 * nothing, so it cannot be used to learn which organizations exist.
 */
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

  const role = row.role === "admin" ? "admin" : "member";
  return {
    ok: true,
    preview: {
      organization: org as unknown as Pick<Organization, "name" | "slug">,
      role,
      email: row.email,
      forYou: Boolean(auth.email && auth.emailConfirmed && normalizeEmail(auth.email) === row.email),
      signedIn: true,
    },
  };
}

/**
 * Accept an invitation: join with its role, mark it used, and hand back the
 * organization to route to. Joining is idempotent (`ensureMembership`), and
 * someone who is already a member keeps the role they have.
 */
export async function acceptInvitation(
  token: string,
): Promise<{ ok: true; organization: Pick<Organization, "name" | "slug"> } | OrgGuardFailure> {
  if (!isInviteToken(token)) return DEAD_LINK;

  const auth = await resolveUserAndService();
  if (!auth.ok) return auth;

  const row = await findOpenInvitation(auth.service, token);
  if (!row) return DEAD_LINK;

  if (!auth.email || !auth.emailConfirmed || normalizeEmail(auth.email) !== row.email) {
    return {
      ok: false,
      status: 403,
      error: `This invitation was sent to ${row.email}. Sign in with that address to accept it.`,
    };
  }

  // Claim the row first, conditionally, so two concurrent accepts of one link
  // cannot both succeed.
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

  return { ok: true, organization: org as unknown as Pick<Organization, "name" | "slug"> };
}
