import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolder,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"

export interface NavItem {
  label: string
  href: string
  /** Pathname that makes this item the current one. */
  match?: string
  icon: IconType
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", match: "/", icon: LuLayoutDashboard },
      // Reports is a section of the dashboard.
      { label: "Reports", href: "/#reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", match: "/projects", icon: LuFolder },
      { label: "Settings", href: "/settings", match: "/settings", icon: LuSettings },
    ],
  },
]

export function crumbsFor(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.match === pathname) return { group: group.label, page: item.label }
    }
  }
  return { group: "Workspace", page: "Lumen" }
}
