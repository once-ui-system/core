import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser, getMyOrg, listMyOrgs } from "@/lib/orgs/context";
import { AppShell } from "@/components/app/app-shell";

// Every page under /app/[org] needs a signed-in member of that organization.
export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/app/${slug}`)}`);
  const org = await getMyOrg(slug);
  if (!org) notFound();
  const orgs = await listMyOrgs();
  return (
    <AppShell org={org} orgs={orgs} email={user.email}>
      {children}
    </AppShell>
  );
}
