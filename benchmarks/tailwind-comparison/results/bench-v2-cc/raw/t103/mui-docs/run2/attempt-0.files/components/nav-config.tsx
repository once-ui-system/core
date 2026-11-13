import type { ReactNode } from "react";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";
import SummarizeOutlined from "@mui/icons-material/SummarizeOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: <SpaceDashboardOutlined fontSize="small" /> },
      { label: "Reports", href: "/reports", icon: <SummarizeOutlined fontSize="small" /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: <FolderOutlined fontSize="small" /> },
      { label: "Settings", href: "/settings", icon: <SettingsOutlined fontSize="small" /> },
    ],
  },
];

export function crumbsFor(pathname: string): string[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return [group.label, item.label];
    }
  }
  return [];
}
