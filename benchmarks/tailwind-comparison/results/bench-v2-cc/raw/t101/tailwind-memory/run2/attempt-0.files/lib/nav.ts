import type { LucideIcon } from "lucide-react";
import { FileText, Folder, LayoutDashboard, Settings } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: Folder },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function findCrumbs(pathname: string): { group: string; item: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, item: item.label };
    }
  }
  return null;
}
