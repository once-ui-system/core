import { siteConfig } from "@/config/site";
import { AppShell } from "@/components/app/shell";
import { DemoNotice } from "@/components/site/demo-notice";
import { getAppContext } from "@/lib/orgs/context";

export default async function OrgLayout({ children, params }: LayoutProps<"/app/[org]">) {
  const { org: slug } = await params;
  const { user, orgs, org } = await getAppContext(slug);
  return (
    <>
      <DemoNotice />
      <AppShell
        siteName={siteConfig.name}
        org={{ slug: org.slug, name: org.name }}
        orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
        email={user.email}
      >
        {children}
      </AppShell>
    </>
  );
}
