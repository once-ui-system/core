// In-memory organizations for demo mode (no Supabase variables). Resets on restart.
import { randomBytes, randomUUID } from "node:crypto";
import { INVITE_DAYS, type AcceptResult, type Member, type Org, type OrgAccess, type Repo, type Role, type Viewer } from "./types";

export const DEMO_VIEWER: Viewer = {
  id: "7d1f0c52-3a6e-4b8e-9a51-0d2c1f000001",
  email: "owner@acme-notes.example",
};

const DEMO_PEOPLE: Record<string, string> = {
  [DEMO_VIEWER.id]: DEMO_VIEWER.email,
  "7d1f0c52-3a6e-4b8e-9a51-0d2c1f000002": "admin@acme-notes.example",
  "7d1f0c52-3a6e-4b8e-9a51-0d2c1f000003": "member@acme-notes.example",
};

type Membership = { org_id: string; user_id: string; role: Role; created_at: string };
type Invitation = { org_id: string; email: string | null; role: Role; token: string; expires_at: string };

const seedOrg: Org = {
  id: "7d1f0c52-3a6e-4b8e-9a51-0d2c1f0000a0",
  slug: "product-team",
  name: "Product Team",
  plan: "free",
  created_at: "2026-10-01T09:00:00.000Z",
};

const orgs: Org[] = [seedOrg];
const memberships: Membership[] = [
  { org_id: seedOrg.id, user_id: DEMO_VIEWER.id, role: "owner", created_at: seedOrg.created_at },
  { org_id: seedOrg.id, user_id: "7d1f0c52-3a6e-4b8e-9a51-0d2c1f000002", role: "admin", created_at: seedOrg.created_at },
  { org_id: seedOrg.id, user_id: "7d1f0c52-3a6e-4b8e-9a51-0d2c1f000003", role: "member", created_at: seedOrg.created_at },
];
const invitations: Invitation[] = [];

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return `${base || "org"}-${randomBytes(3).toString("hex")}`;
}

function roleOf(viewer: Viewer, orgId: string): Role | null {
  return memberships.find((m) => m.org_id === orgId && m.user_id === viewer.id)?.role ?? null;
}

export const demoRepo: Repo = {
  async listOrgs(viewer) {
    return orgs
      .filter((o) => roleOf(viewer, o.id))
      .map((o) => ({ ...o, role: roleOf(viewer, o.id) as Role }));
  },

  async findOrg(viewer, slug) {
    const org = orgs.find((o) => o.slug === slug);
    const role = org ? roleOf(viewer, org.id) : null;
    return org && role ? { ...org, role } : null;
  },

  async createOrg(viewer, name) {
    const org: Org = {
      id: randomUUID(),
      slug: slugify(name),
      name: name.trim(),
      plan: "free",
      created_at: new Date().toISOString(),
    };
    orgs.push(org);
    memberships.push({ org_id: org.id, user_id: viewer.id, role: "owner", created_at: org.created_at });
    DEMO_PEOPLE[viewer.id] = viewer.email;
    return org;
  },

  async renameOrg(viewer, orgId, name) {
    const role = roleOf(viewer, orgId);
    const org = orgs.find((o) => o.id === orgId);
    if (!org || !role || (role !== "owner" && role !== "admin")) return false;
    org.name = name.trim();
    return true;
  },

  async listMembers(orgId) {
    return memberships
      .filter((m) => m.org_id === orgId)
      .map((m) => ({ user_id: m.user_id, email: DEMO_PEOPLE[m.user_id] ?? "", role: m.role }) satisfies Member);
  },

  async createInvitation(_viewer, orgId, email, role) {
    const token = randomBytes(32).toString("base64url");
    const expires_at = new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString();
    invitations.push({ org_id: orgId, email, role, token, expires_at });
    return { token, expires_at };
  },

  async acceptInvitation(viewer, token): Promise<AcceptResult> {
    const inv = invitations.find((i) => i.token === token);
    if (!inv) return { status: "not_found" };
    if (new Date(inv.expires_at).getTime() <= Date.now()) return { status: "expired" };
    const org = orgs.find((o) => o.id === inv.org_id);
    if (!org) return { status: "not_found" };
    if (!roleOf(viewer, org.id)) {
      memberships.push({ org_id: org.id, user_id: viewer.id, role: inv.role, created_at: new Date().toISOString() });
      DEMO_PEOPLE[viewer.id] = viewer.email;
    }
    return { status: "ok", id: org.id, slug: org.slug, name: org.name, role: roleOf(viewer, org.id) as Role };
  },

  async setPlan(orgId, plan) {
    const org = orgs.find((o) => o.id === orgId);
    if (org) org.plan = plan;
  },
};
