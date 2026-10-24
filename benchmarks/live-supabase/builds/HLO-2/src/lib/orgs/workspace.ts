import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";
import { demoMembers, demoOrgs, demoUser } from "./demo";
import { listMembers, listMyOrganizations } from "./service";
import type { MemberRow, OrgSummary } from "./types";

export type Workspace = {
  isDemo: boolean;
  user: { id: string; email: string };
  orgs: OrgSummary[];
  org: OrgSummary;
  // Null in demo mode.
  sb: SupabaseClient | null;
};

// Loads the signed-in user and one organization for an /app/[org] page. Signed-out
// users go to sign-in; a slug the user is not a member of is a 404.
export const loadWorkspace = cache(async (slug: string): Promise<Workspace> => {
  if (!isSupabaseConfigured()) {
    const org = demoOrgs.find((o) => o.slug === slug);
    if (!org) notFound();
    return { isDemo: true, user: demoUser, orgs: demoOrgs, org, sb: null };
  }

  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user || !user.email) redirect(`/auth?next=${encodeURIComponent(`/app/${slug}`)}`);

  const orgs = await listMyOrganizations(sb);
  const org = orgs.find((o) => o.slug === slug);
  if (!org) notFound();
  return { isDemo: false, user: { id: user.id, email: user.email }, orgs, org, sb };
});

export async function membersOf(ws: Workspace): Promise<MemberRow[]> {
  if (ws.isDemo || !ws.sb) return demoMembers[ws.org.slug] ?? [];
  return listMembers(ws.sb, ws.org.id);
}
