import { BarChart3, FileText, FolderKanban, LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function crumbsFor(pathname: string): { group: string; title: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, title: item.title };
    }
  }
  return { group: "Lumen", title: "Page" };
}

export { FileText };
