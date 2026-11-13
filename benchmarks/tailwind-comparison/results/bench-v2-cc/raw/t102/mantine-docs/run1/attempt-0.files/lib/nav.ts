import {
  IconBriefcase,
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface NavGroup {
  label: string;
  icon: Icon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartBar,
    items: [
      { label: "Overview", href: "/", icon: IconLayoutDashboard },
      { label: "Reports", href: "/reports", icon: IconFileAnalytics },
    ],
  },
  {
    label: "Workspace",
    icon: IconBriefcase,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
}
