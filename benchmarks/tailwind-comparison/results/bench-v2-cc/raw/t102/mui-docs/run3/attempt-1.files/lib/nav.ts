import type { SvgIconComponent } from "@mui/icons-material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FolderIcon from "@mui/icons-material/Folder";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";

export type NavItem = { label: string; href: string; icon: SvgIconComponent };
export type NavGroup = { id: string; label: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: InsightsIcon },
      { label: "Reports", href: "/reports", icon: AssessmentIcon },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: FolderIcon },
      { label: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findCrumb(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(item.href, pathname)) return { group, item };
    }
  }
  return null;
}
