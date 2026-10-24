"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar, type ShellOrg } from "@/components/app/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Routes under /app that are not organizations.
const RESERVED = new Set(["new", "profile"]);

function slugFromPath(pathname: string): string | null {
  const match = /^\/app\/([^/]+)/.exec(pathname);
  if (!match || RESERVED.has(match[1])) return null;
  return decodeURIComponent(match[1]);
}

export function AppShell({
  email,
  orgs,
  children,
}: {
  email: string;
  orgs: ShellOrg[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const slug = slugFromPath(pathname);
  const current = slug ? (orgs.find((o) => o.slug === slug) ?? { slug, name: slug, role: "member" as const }) : null;

  return (
    <SidebarProvider>
      {current && <AppSidebar org={current} pathname={pathname} />}
      <SidebarInset>
        <AppHeader email={email} orgs={orgs} current={current} />
        <main className="flex flex-1 flex-col p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
