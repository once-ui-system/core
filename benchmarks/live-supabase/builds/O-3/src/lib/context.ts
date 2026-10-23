import { notFound, redirect } from "next/navigation";
import { DEMO_ORG, DEMO_USER } from "./demo";
import { isSupabaseConfigured } from "./env";
import { currentUser, listOrgs, type OrgWithRole } from "./orgs";

export type AppContext = {
  demo: boolean;
  user: { id: string; email: string };
  orgs: OrgWithRole[];
  current: OrgWithRole | null;
};

export async function loadContext(slug?: string): Promise<AppContext> {
  if (!isSupabaseConfigured()) {
    return { demo: true, user: DEMO_USER, orgs: [DEMO_ORG], current: slug === undefined ? null : DEMO_ORG };
  }
  const user = await currentUser();
  if (!user) redirect("/auth");
  const orgs = await listOrgs(user.id);
  let current: OrgWithRole | null = null;
  if (slug !== undefined) {
    current = orgs.find((o) => o.slug === slug) ?? null;
    if (!current) notFound();
  }
  return { demo: false, user: { id: user.id, email: user.email ?? "" }, orgs, current };
}
