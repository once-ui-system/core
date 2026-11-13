import type { ComponentType } from "react";
import {
  IconChartBar,
  IconFileAnalytics,
  IconFolders,
  IconSettings,
  IconChartDots3,
  IconBriefcase,
} from "@tabler/icons-react";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; stroke?: number }>;
}

export interface NavGroup {
  label: string;
  icon: ComponentType<{ size?: number; stroke?: number }>;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartDots3,
    items: [
      { label: "Overview", href: "/", icon: IconChartBar },
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

/** Breadcrumb trail for a pathname, derived from the navigation groups. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [
          { label: "Lumen", href: "/" },
          { label: group.label },
          { label: item.label },
        ];
      }
    }
  }
  return [{ label: "Lumen", href: "/" }];
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
