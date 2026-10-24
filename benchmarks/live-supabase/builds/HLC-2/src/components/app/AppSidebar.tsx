"use client";

import Link from "next/link";
import { LayoutDashboardIcon, SettingsIcon, UsersIcon } from "lucide-react";
import type { Role } from "@/lib/orgs/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export type ShellOrg = { slug: string; name: string; role: Role };

export function AppSidebar({ org, pathname }: { org: ShellOrg; pathname: string }) {
  const base = `/app/${org.slug}`;
  const items = [
    { title: "Dashboard", href: base, icon: LayoutDashboardIcon },
    { title: "Members", href: `${base}/members`, icon: UsersIcon },
    { title: "Settings", href: `${base}/settings`, icon: SettingsIcon },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <p className="truncate px-2 py-1 text-sm font-semibold">{org.name}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
