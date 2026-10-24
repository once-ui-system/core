"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, MenuIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "cn";

export function AppNav({ slug, orgName, role }: { slug: string; orgName: string; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const base = `/app/${slug}`;
  const items = [
    { href: base, label: "Dashboard", icon: LayoutDashboardIcon, exact: true },
    { href: `${base}/members`, label: "Members", icon: UsersIcon, exact: false },
    { href: `${base}/settings`, label: "Settings", icon: SettingsIcon, exact: false },
  ];

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const links = (onNavigate?: () => void) => (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const header = (
    <div className="px-3 pb-4">
      <p className="truncate text-sm font-semibold">{orgName}</p>
      <p className="text-xs capitalize text-muted-foreground">{role}</p>
    </div>
  );

  return (
    <>
      {/* Desktop: fixed sidebar. */}
      <aside className="hidden w-60 shrink-0 border-r border-border p-4 md:block" aria-label="Organization">
        {header}
        {links()}
      </aside>

      {/* Mobile: the sidebar collapses into a sheet opened from a top bar. */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Open navigation" />}>
            <MenuIcon aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{orgName}</SheetTitle>
              <SheetDescription className="capitalize">{role}</SheetDescription>
            </SheetHeader>
            <nav aria-label="Organization" className="px-4">
              {links(() => setOpen(false))}
            </nav>
          </SheetContent>
        </Sheet>
        <p className="truncate text-sm font-medium">{orgName}</p>
      </div>
    </>
  );
}
