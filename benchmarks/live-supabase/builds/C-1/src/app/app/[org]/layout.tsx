import { notFound, redirect } from "next/navigation";
import { getMembership, getUser, listUserOrgs } from "@/lib/orgs";
import { AppShell } from "@/components/app-shell";

export default async function OrgLayout({ children, params }: LayoutProps<"/app/[org]">) {
  const { org: slug } = await params;
  const user = await getUser();
  if (!user) redirect("/auth");
  const org = await getMembership(user.id, slug);
  if (!org) notFound();
  const orgs = await listUserOrgs(user.id);
  return (
    <AppShell
      org={{ slug: org.slug, name: org.name }}
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      email={user.email}
    >
      {children}
    </AppShell>
  );
}
