"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { findCurrent } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const current = findCurrent(pathname);
  const { setOpenMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-10 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setOpenMobile(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 text-xs sm:gap-1.5">
          <BreadcrumbItem>Lumen</BreadcrumbItem>
          {current && (
            <Fragment>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{current.group.label}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{current.item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </Fragment>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
