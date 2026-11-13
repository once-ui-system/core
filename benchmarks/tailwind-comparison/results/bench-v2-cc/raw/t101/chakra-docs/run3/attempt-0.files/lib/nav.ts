import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolderOpen,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"

export interface NavItem {
  label: string
  href: string
  icon: IconType
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolderOpen },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findNav(
  pathname: string,
): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item }
    }
  }
  return undefined
}
