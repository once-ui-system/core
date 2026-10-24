export type Role = "owner" | "admin" | "member";
export type Plan = "free" | "team";

export const ROLES: Role[] = ["owner", "admin", "member"];
export const CAN_MANAGE: Role[] = ["owner", "admin"];

export type Viewer = { id: string; email: string };

export type Org = { id: string; slug: string; name: string; plan: Plan; created_at: string };

/** An organization as seen by one viewer: their own role in it. */
export type OrgAccess = Org & { role: Role };

export type Member = { user_id: string; email: string; role: Role };

export type AcceptResult =
  | { status: "ok"; id: string; slug: string; name: string; role: Role }
  | { status: "not_found" }
  | { status: "expired" };

export type Repo = {
  listOrgs(viewer: Viewer): Promise<OrgAccess[]>;
  findOrg(viewer: Viewer, slug: string): Promise<OrgAccess | null>;
  createOrg(viewer: Viewer, name: string): Promise<Org>;
  renameOrg(viewer: Viewer, orgId: string, name: string): Promise<boolean>;
  listMembers(orgId: string): Promise<Member[]>;
  createInvitation(
    viewer: Viewer,
    orgId: string,
    email: string | null,
    role: Exclude<Role, "owner">,
  ): Promise<{ token: string; expires_at: string }>;
  acceptInvitation(viewer: Viewer, token: string): Promise<AcceptResult>;
  setPlan(orgId: string, plan: Plan): Promise<void>;
};

export const INVITE_DAYS = 7;

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
