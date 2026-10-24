import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { orgNav } from "@/resources/app";
import { loadWorkspace } from "@/lib/orgs/workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const ws = await loadWorkspace(slug);
  return (
    <AppShell
      orgs={ws.orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      current={{ slug: ws.org.slug, name: ws.org.name }}
      email={ws.user.email}
      isDemo={ws.isDemo}
      links={orgNav(ws.org.slug)}
    >
      {children}
    </AppShell>
  );
}
