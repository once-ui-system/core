"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Settings, Users, type LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";

const items: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Dashboard", path: "", icon: LayoutDashboard },
  { label: "Members", path: "/members", icon: Users },
  { label: "Settings", path: "/settings", icon: Settings },
];

function NavList({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const base = `/app/${slug}`;
  return (
    <nav className="flex flex-col gap-1" aria-label="Organization">
      {items.map((item) => {
        const href = `${base}${item.path}`;
        const active = item.path === "" ? pathname === base : pathname.startsWith(href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Desktop sidebar. Hidden below the md breakpoint, where MobileNav takes over.
export function DesktopSidebar({ slug }: { slug: string }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 md:block">
      <NavList slug={slug} />
    </aside>
  );
}

// Collapsed menu button for small screens; opens the same navigation in a sheet.
export function MobileNav({ slug }: { slug: string }) {
  return (
    <Sheet>
      <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden" })} aria-label="Open navigation">
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-4">
        <SheetTitle className="mb-4 px-3 text-sm font-semibold">Navigation</SheetTitle>
        <NavList slug={slug} />
      </SheetContent>
    </Sheet>
  );
}
