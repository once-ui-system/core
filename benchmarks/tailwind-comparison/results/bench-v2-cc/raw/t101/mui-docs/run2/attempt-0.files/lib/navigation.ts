import type { ElementType } from "react";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BarChartIcon from "@mui/icons-material/BarChart";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SettingsIcon from "@mui/icons-material/Settings";

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
    icon: BarChartIcon,
    items: [
      { label: "Overview", href: "/", icon: DashboardIcon },
      { label: "Reports", href: "/reports", icon: AssessmentIcon },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: BusinessIcon,
    items: [
      { label: "Projects", href: "/projects", icon: FolderOpenIcon },
      { label: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group, item };
    }
  }
  return undefined;
}
