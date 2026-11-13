"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getBreadcrumbs } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1 size-8" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    <BreadcrumbItem className={last ? undefined : "hidden sm:inline-flex"}>
                      {last ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : crumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                    {last ? null : (
                      <BreadcrumbSeparator className="hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
