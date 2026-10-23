import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppHeader } from "@/components/app/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrgContext, getSessionUser, listUserOrgs } from "@/lib/orgs";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/app/${slug}`)}`);
  const ctx = await getOrgContext(slug, user.id);
  if (!ctx) notFound();
  const orgs = await listUserOrgs(user.id);

  return (
    <SidebarProvider>
      <AppSidebar slug={ctx.org.slug} orgName={ctx.org.name} />
      <SidebarInset>
        <AppHeader
          current={ctx.org.slug}
          orgs={orgs.map((o) => ({ slug: o.org.slug, name: o.org.name }))}
          email={user.email}
        />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
