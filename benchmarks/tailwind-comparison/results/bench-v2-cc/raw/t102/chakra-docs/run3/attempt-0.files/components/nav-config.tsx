import type { IconType } from "react-icons"
import { LuChartColumn, LuFileText, LuFolderKanban, LuSettings } from "react-icons/lu"

export interface NavItem {
  label: string
  href: string
  icon: IconType
  // Route that marks this item as current (anchors are never "current").
  route?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuChartColumn, route: "/" },
      { label: "Reports", href: "/#reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        label: "Projects",
        href: "/projects",
        icon: LuFolderKanban,
        route: "/projects",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: LuSettings,
        route: "/settings",
      },
    ],
  },
]

export function isCurrent(item: NavItem, pathname: string): boolean {
  if (!item.route) return false
  if (item.route === "/") return pathname === "/"
  return pathname === item.route || pathname.startsWith(`${item.route}/`)
}

export interface Crumb {
  label: string
  href?: string
}

export function crumbsFor(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }]
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }]
  }
  return [{ label: "Analytics" }, { label: "Overview" }]
}
