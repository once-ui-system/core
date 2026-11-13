"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { findCurrent } from "@/lib/nav";

export function AppHeader() {
  const pathname = usePathname();
  const current = findCurrent(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="size-11" />
      <Separator orientation="vertical" className="h-6" />
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:gap-2.5">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="rounded-sm px-1 text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                Lumen
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{current.group}</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold">{current.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
