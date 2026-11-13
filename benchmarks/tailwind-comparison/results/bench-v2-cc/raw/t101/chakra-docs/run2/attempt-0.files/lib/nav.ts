import type { IconType } from "react-icons"
import {
  LuFileText,
  LuFolderKanban,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"

export interface NavItemData {
  label: string
  href: string
  icon: IconType
}

export interface NavGroupData {
  label: string
  items: NavItemData[]
}

export const navGroups: NavGroupData[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolderKanban },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

export function findNav(pathname: string) {
  for (const group of navGroups) {
    const item = group.items.find((i) => i.href === pathname)
    if (item) return { group: group.label, label: item.label }
  }
  return { group: "Lumen", label: "Page" }
}
