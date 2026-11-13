"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileBarChart, FolderKanban, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { initials, user } from "@/lib/data";

type NavItem = { title: string; href: string | null; icon: LucideIcon };
type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "Analytics",
    icon: BarChart3,
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      // No Reports screen exists yet in this shell, so it is shown but not linked.
      { title: "Reports", href: null, icon: FileBarChart },
    ],
  },
  {
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const activeClasses =
  "h-11 text-base data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground hover:data-[active=true]:bg-sidebar-primary hover:data-[active=true]:text-sidebar-primary-foreground";

function findCrumbs(pathname: string): { group: string; title: string } {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, title: item.title };
    }
  }
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href && item.href !== "/" && pathname.startsWith(item.href)) {
        return { group: group.label, title: item.title };
      }
    }
  }
  return { group: "Analytics", title: "Overview" };
}

function NavMenu() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      {NAV.map((group) => (
        <SidebarGroup key={group.label} role="group" aria-label={group.label}>
          <SidebarGroupLabel className="h-9 px-3 text-xs font-semibold tracking-wide uppercase">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const Icon = item.icon;
                if (!item.href) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={`${item.title} (coming soon)`}
                        aria-disabled="true"
                        disabled
                        className={activeClasses}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="top-3">Soon</SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                }
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={activeClasses}
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Icon />
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
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = findCrumbs(pathname);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" aria-label="Main navigation">
        <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md p-1 outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-xl font-bold group-data-[collapsible=icon]:hidden">
              Lumen
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <NavMenu />
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
          <div className="flex items-center gap-3 rounded-md p-1">
            <Avatar className="size-10">
              <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-sm group-data-[collapsible=icon]:hidden">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
          <SidebarTrigger aria-label="Toggle navigation menu" />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-sm sm:text-base">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Lumen</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="hidden sm:inline-flex">{crumbs.group}</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{crumbs.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8 md:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
