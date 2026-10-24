import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { currentViewer } from "@/lib/app-context";
import { listMyOrgs } from "@/lib/orgs/queries";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const viewer = await currentViewer();
  if (!viewer) redirect("/auth?next=/app");
  const orgs = await listMyOrgs(viewer.id);
  return (
    <AppShell
      email={viewer.email}
      orgs={orgs.map((o) => ({ slug: o.org.slug, name: o.org.name, role: o.role }))}
    >
      {children}
    </AppShell>
  );
}
