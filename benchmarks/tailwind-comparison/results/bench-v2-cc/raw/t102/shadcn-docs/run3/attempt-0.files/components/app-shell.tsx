"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeft } from "lucide-react";

import { AppSidebar, navGroups } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function MenuButton() {
  const { toggleSidebar, isMobile, openMobile, state } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={toggleSidebar}
      aria-label={isMobile ? "Open navigation menu" : state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={isMobile ? openMobile : state === "expanded"}
    >
      {isMobile ? <Menu className="size-5" /> : <PanelLeft className="size-5" />}
    </Button>
  );
}

function HeaderBreadcrumb() {
  const pathname = usePathname();
  let crumb: { group: string; title: string } | undefined;
  for (const group of navGroups) {
    for (const item of group.items) {
      const match = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (match) crumb = { group: group.label, title: item.title };
    }
  }
  if (!crumb) return null;
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-sm sm:text-base">
        <BreadcrumbItem>
          <span>{crumb.group}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold">{crumb.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        style={{ color: "var(--primary-foreground)" }}
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset id="main" className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <MenuButton />
          <Separator orientation="vertical" className="h-6" />
          <HeaderBreadcrumb />
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
