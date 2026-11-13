import type { ElementType } from "react";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import WorkspacesRounded from "@mui/icons-material/WorkspacesRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: ElementType;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: InsightsRounded,
    items: [
      { label: "Overview", href: "/", icon: DashboardRounded },
      { label: "Reports", href: "/reports", icon: BarChartRounded },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: WorkspacesRounded,
    items: [
      { label: "Projects", href: "/projects", icon: FolderRounded },
      { label: "Settings", href: "/settings", icon: SettingsRounded },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNav(
  pathname: string,
): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
}
