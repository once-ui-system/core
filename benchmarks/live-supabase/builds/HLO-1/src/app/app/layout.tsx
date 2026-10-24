import { redirect } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { getCurrentUser } from "../../lib/auth";
import { DEMO_ORG, listOrganizationsFor } from "../../lib/orgs";
import { isSupabaseConfigured } from "../../lib/supabase/config";

// Depends on the environment (demo mode or live), so render per request.
export const dynamic = "force-dynamic";

export default async function SignedInLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();
  if (configured && !user) redirect("/auth");

  const orgs = configured && user ? await listOrganizationsFor(user.id) : [DEMO_ORG];

  return (
    <AppShell
      email={configured ? (user?.email ?? "") : "Demo mode"}
      demo={!configured}
      orgs={orgs.map(({ slug, name, role }) => ({ slug, name, role }))}
    >
      {children}
    </AppShell>
  );
}
