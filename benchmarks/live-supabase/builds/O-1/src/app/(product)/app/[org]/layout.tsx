import { AppShell } from "../../../../components/AppShell";
import { loadOrgContext } from "../../../../lib/context";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const ctx = await loadOrgContext(slug);
  return (
    <AppShell
      org={{ slug: ctx.org.slug, name: ctx.org.name }}
      orgs={ctx.orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      email={ctx.user.email}
      demo={ctx.demo}
    >
      {children}
    </AppShell>
  );
}
