"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

import { getBreadcrumbs } from "@/lib/navigation";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppHeader() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-3 border-b bg-background/90 px-5 backdrop-blur sm:px-8 lg:px-10">
      {isMobile ? (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Open navigation menu"
        >
          <MenuIcon aria-hidden="true" />
        </Button>
      ) : (
        <>
          <SidebarTrigger
            className="size-11"
            aria-label="Collapse or expand sidebar"
          />
          <Separator orientation="vertical" className="mx-1 h-6" />
        </>
      )}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap text-base">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                <BreadcrumbItem className="min-w-0">
                  {last ? (
                    <BreadcrumbPage className="truncate font-heading font-semibold">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
