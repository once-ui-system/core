import {
  ChartColumn,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: ChartColumn },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const brandIcon = FileText;

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === path) return { group, item };
    }
  }
  return null;
}
