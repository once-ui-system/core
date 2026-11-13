import Link from "next/link";
import { Home as HomeIcon } from "lucide-react";
import { SITE } from "@/lib/data";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HomeIcon className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg">{SITE.name}</span>
        </Link>
        <p className="hidden text-sm text-muted-foreground sm:block">
          Homes for sale in {SITE.city}
        </p>
      </div>
    </header>
  );
}
