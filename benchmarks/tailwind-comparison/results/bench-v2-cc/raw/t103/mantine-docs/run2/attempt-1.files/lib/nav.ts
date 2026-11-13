import {
  IconBriefcase,
  IconChartLine,
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
    icon: IconChartLine,
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

export interface Crumb {
  label: string;
  href?: string;
}

export function crumbsFor(pathname: string): Crumb[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [{ label: group.label }, { label: item.label, href: item.href }];
      }
    }
  }
  return [{ label: "Lumen" }];
}
