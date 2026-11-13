"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface Crumb {
  group: string;
  title: string;
}

const crumbs: Record<string, Crumb> = {
  "/": { group: "Analytics", title: "Overview" },
  "/reports": { group: "Analytics", title: "Reports" },
  "/projects": { group: "Workspace", title: "Projects" },
  "/settings": { group: "Workspace", title: "Settings" },
};

function MobileMenuButton() {
  const { setOpenMobile } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setOpenMobile(true)}
    >
      <Menu aria-hidden="true" />
      <span className="sr-only">Open navigation menu</span>
    </Button>
  );
}

function ShellHeader() {
  const pathname = usePathname();
  const crumb = crumbs[pathname] ?? { group: "Workspace", title: "Page" };

  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <MobileMenuButton />
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="hidden data-[orientation=vertical]:h-4 md:block" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1 text-xs sm:gap-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Lumen</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <span>{crumb.group}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-1.5 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <ShellHeader />
        <div id="main-content" tabIndex={-1} className="flex-1 p-3 outline-none sm:p-4 lg:p-5">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
