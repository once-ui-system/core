"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { user } from "@/lib/data";
import { brandIcon as BrandIcon, isActive, navGroups } from "@/lib/nav";

const initials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("");

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Close the phone drawer after navigating.
  React.useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" aria-label="Primary">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lumen">
              <Link href="/">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <BrandIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-heading text-sm font-semibold">Lumen</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Acme Labs workspace</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-heading text-[11px] tracking-wider uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu aria-label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(pathname, item);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground"
                      >
                        <Link href={item.href} aria-current={active ? "page" : undefined}>
                          <item.icon aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent font-heading text-xs text-sidebar-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
