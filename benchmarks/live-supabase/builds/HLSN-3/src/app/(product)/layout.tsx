import { AppShell } from "@/components/app/AppShell";
import { getViewer } from "@/lib/session";
import { listMemberships } from "@/lib/orgs/queries";
import { isSupabaseConfigured } from "@/lib/env";

// The shell reads the session and the environment on each request.
export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const viewer = await getViewer();
  const orgs = await listMemberships(viewer?.id ?? null);
  return (
    <AppShell
      demo={!isSupabaseConfigured()}
      email={viewer?.email ?? null}
      organizations={orgs.map(({ id, slug, name, role }) => ({ id, slug, name, role }))}
    >
      {children}
    </AppShell>
  );
}
