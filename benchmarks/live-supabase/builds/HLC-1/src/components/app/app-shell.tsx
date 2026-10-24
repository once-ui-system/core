import { DesktopSidebar, MobileNav } from "@/components/app/app-nav";
import { OrgSwitcher } from "@/components/app/org-switcher";
import { UserMenu } from "@/components/app/user-menu";
import { DemoBanner } from "@/components/app/demo-banner";
import type { OrgWithRole } from "@/lib/orgs/types";

export function AppShell({
  org,
  orgs,
  email,
  children,
}: {
  org: OrgWithRole;
  orgs: OrgWithRole[];
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <MobileNav slug={org.slug} />
          <span className="hidden text-sm font-semibold text-primary sm:inline">Acme Notes</span>
          <span className="hidden text-muted-foreground sm:inline">/</span>
          <OrgSwitcher orgs={orgs} current={org} />
        </div>
        <UserMenu email={email} />
      </header>
      <div className="flex flex-1">
        <DesktopSidebar slug={org.slug} />
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
          <DemoBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
