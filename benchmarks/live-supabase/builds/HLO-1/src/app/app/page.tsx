import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import { DEMO_ORG, listOrganizationsFor } from "../../lib/orgs";
import { isSupabaseConfigured } from "../../lib/supabase/config";

// Depends on the environment (demo mode or live), so render per request.
export const dynamic = "force-dynamic";

/** Sends the user to their first organization, or to the form that creates one. */
export default async function AppIndex() {
  if (!isSupabaseConfigured()) redirect(`/app/${DEMO_ORG.slug}`);
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  const orgs = await listOrganizationsFor(user.id);
  redirect(orgs.length ? `/app/${orgs[0].slug}` : "/app/new");
}
