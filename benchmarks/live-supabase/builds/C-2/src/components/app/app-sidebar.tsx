"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/lib/config";

export function AppSidebar({ slug, orgName }: { slug: string; orgName: string }) {
  const pathname = usePathname();
  const base = `/app/${slug}`;
  const items = [
    { href: base, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/members`, label: "Members", icon: Users },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-semibold">{siteConfig.name}</span>
        <span className="truncate text-xs text-muted-foreground">{orgName}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.href}>
                  <SidebarMenuButton isActive={pathname === it.href} render={<Link href={it.href} />}>
                    <it.icon />
                    <span>{it.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
