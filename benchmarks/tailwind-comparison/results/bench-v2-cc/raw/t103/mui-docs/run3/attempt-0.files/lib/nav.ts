import type { ElementType } from "react";
import AnalyticsOutlined from "@mui/icons-material/AnalyticsOutlined";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";

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
    icon: AnalyticsOutlined,
    items: [
      { label: "Overview", href: "/", icon: SpaceDashboardOutlined },
      { label: "Reports", href: "/reports", icon: AssessmentOutlined },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderOutlined,
    items: [
      { label: "Projects", href: "/projects", icon: FolderOutlined },
      { label: "Settings", href: "/settings", icon: SettingsOutlined },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumbs(pathname: string): { group: string; page: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return { group: group.label, page: item.label };
    }
  }
  return null;
}
