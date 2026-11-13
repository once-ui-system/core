"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun } from "lucide-react";

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
import { isActivePath, navGroups } from "@/lib/nav";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          aria-label="Lumen home"
          onClick={() => setOpenMobile(false)}
          className="flex h-8 items-center gap-2 rounded-sm px-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
            <Sun className="size-4" aria-hidden="true" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Lumen
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label} className="py-1">
              <SidebarGroupLabel className="h-7">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          className="h-7"
                        >
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setOpenMobile(false)}
                          >
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
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-sm p-1">
          <Avatar className="size-7">
            <AvatarFallback className="bg-secondary text-xs font-medium">MO</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-xs leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-muted-foreground">
              {user.role} · {user.email}
            </span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
