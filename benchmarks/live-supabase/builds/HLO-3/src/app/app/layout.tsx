import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer, listOrgs } from "@/lib/orgs";

// Signed-in pages read the viewer and live organization data on every request.
export const dynamic = "force-dynamic";

// Every page under /app renders inside the shell and needs a signed-in viewer
// (the proxy redirects first; this check covers the rest).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth");
  const orgs = await listOrgs(viewer);

  return (
    <AppShell
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      email={viewer.email}
      demo={!isSupabaseConfigured()}
    >
      {children}
    </AppShell>
  );
}
