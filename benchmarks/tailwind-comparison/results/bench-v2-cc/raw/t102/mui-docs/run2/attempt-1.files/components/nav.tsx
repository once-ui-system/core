"use client";

import type { ReactNode } from "react";
import AssessmentRounded from "@mui/icons-material/AssessmentRounded";
import FolderRounded from "@mui/icons-material/FolderRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import WorkspacesRounded from "@mui/icons-material/WorkspacesRounded";

export type NavItem = { label: string; href: string; icon: ReactNode };
export type NavGroup = { id: string; label: string; icon: ReactNode; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: <InsightsRounded />,
    items: [
      { label: "Overview", href: "/", icon: <SpaceDashboardRounded /> },
      { label: "Reports", href: "/reports", icon: <AssessmentRounded /> },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: <WorkspacesRounded />,
    items: [
      { label: "Projects", href: "/projects", icon: <FolderRounded /> },
      { label: "Settings", href: "/settings", icon: <SettingsRounded /> },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumbs(pathname: string): { group: string; page: string } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group: group.label, page: item.label };
    }
  }
  return null;
}
