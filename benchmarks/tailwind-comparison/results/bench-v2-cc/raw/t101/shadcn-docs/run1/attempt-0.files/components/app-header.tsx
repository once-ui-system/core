"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { findNav } from "@/lib/nav"

export function AppHeader() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const current = findNav(pathname)

  return (
    <header className="sticky top-0 z-10 flex h-11 shrink-0 items-center gap-2 border-b bg-background px-3">
      <SidebarTrigger className="hidden md:inline-flex" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 md:hidden"
        aria-label="Open navigation menu"
        onClick={() => setOpenMobile(true)}
      >
        <Menu aria-hidden="true" />
      </Button>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-1.5 text-[0.8125rem] sm:gap-1.5">
          <BreadcrumbItem>
            <span>{current?.group.title ?? "Lumen"}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.item.title ?? "Page"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
