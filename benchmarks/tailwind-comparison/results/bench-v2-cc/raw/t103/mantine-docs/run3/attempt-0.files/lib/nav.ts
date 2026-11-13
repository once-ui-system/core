import {
  IconBriefcase,
  IconChartLine,
  IconFolders,
  IconGauge,
  IconReportAnalytics,
  IconSettings,
} from "@tabler/icons-react";

export type NavIcon = typeof IconGauge;

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

export interface NavGroup {
  label: string;
  icon: NavIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartLine,
    items: [
      { label: "Overview", href: "/", icon: IconGauge },
      { label: "Reports", href: "/reports", icon: IconReportAnalytics },
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

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function getCrumbs(pathname: string): { group: string; page: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return { group: "Lumen", page: "Not found" };
}
