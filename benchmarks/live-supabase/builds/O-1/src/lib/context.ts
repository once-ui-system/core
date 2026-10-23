import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getOrgForUser, getSessionUser, listUserOrgs, type OrgWithRole } from "./orgs";
import { isSupabaseConfigured } from "./supabase/config";

export const DEMO_SLUG = "demo";

export type OrgContext = {
  demo: boolean;
  user: { id: string; email: string };
  org: OrgWithRole;
  orgs: OrgWithRole[];
};

const demoOrg: OrgWithRole = { id: "demo", slug: DEMO_SLUG, name: "Demo workspace", plan: "free", role: "owner" };

export const liveReady = () => isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** The signed-in user's organizations, or the sample one in demo mode. Redirects to /auth when signed out. */
export const loadUserOrgs = cache(async () => {
  if (!liveReady()) return { demo: true, user: { id: "demo", email: "you@acme-notes.example" }, orgs: [demoOrg] };
  const user = await getSessionUser();
  if (!user) redirect("/auth");
  return { demo: false, user, orgs: await listUserOrgs(user.id) };
});

export const loadOrgContext = cache(async (slug: string): Promise<OrgContext> => {
  const base = await loadUserOrgs();
  if (base.demo) {
    if (slug !== DEMO_SLUG) notFound();
    return { ...base, org: demoOrg };
  }
  const org = await getOrgForUser(slug, base.user.id);
  if (!org) notFound();
  return { ...base, org };
});
