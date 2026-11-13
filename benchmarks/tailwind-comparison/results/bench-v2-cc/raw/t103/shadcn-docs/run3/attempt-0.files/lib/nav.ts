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

export const brandIcon = FileText;

export function findNav(pathname: string): { group: string; title: string } | null {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return { group: group.label, title: item.title };
  }
  return null;
}
