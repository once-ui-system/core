import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { title: string; href: string; icon: LucideIcon }
export type NavGroup = { title: string; items: NavItem[] }

export const navGroups: NavGroup[] = [
  {
    title: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    title: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.href === pathname)
    if (item) return { group, item }
  }
  return null
}
