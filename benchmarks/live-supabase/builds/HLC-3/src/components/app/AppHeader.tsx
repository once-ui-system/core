import Link from "next/link";
import { site } from "@/config/site";
import { OrgSwitcher, type SwitcherOrg } from "./OrgSwitcher";
import { UserMenu } from "./UserMenu";

export function AppHeader({ orgs, email }: { orgs: SwitcherOrg[]; email: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/app" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
            <span className="size-2.5 rounded-full bg-brand" aria-hidden="true" />
            {site.name}
          </Link>
          {orgs.length > 0 && <OrgSwitcher orgs={orgs} />}
        </div>
        <UserMenu email={email} />
      </div>
    </header>
  );
}
