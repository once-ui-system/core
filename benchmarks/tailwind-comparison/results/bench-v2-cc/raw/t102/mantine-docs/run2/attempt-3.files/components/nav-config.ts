import {
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconSettings,
  IconStack2,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

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
      { label: "Reports", href: "/reports", icon: IconReportAnalytics },
    ],
  },
  {
    label: "Workspace",
    icon: IconStack2,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

export function findCrumbs(pathname: string): { group: string; label: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, label: item.label };
    }
  }
  return null;
}
