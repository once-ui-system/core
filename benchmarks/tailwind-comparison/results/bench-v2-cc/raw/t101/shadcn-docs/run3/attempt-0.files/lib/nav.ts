import {
  ChartColumn,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
      { title: "Reports", href: "/reports", icon: ChartColumn },
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

export const fallbackIcon = FileText;

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCurrent(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActivePath(pathname, item.href)) return { group, item };
    }
  }
  return null;
}
