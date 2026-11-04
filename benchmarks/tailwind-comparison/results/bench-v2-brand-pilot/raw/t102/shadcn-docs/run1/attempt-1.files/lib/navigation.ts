import {
  BarChart3Icon,
  FileBarChartIcon,
  FolderKanbanIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/**
 * Overview is the dashboard at "/". Reports has no screen of its own in this
 * shell, so it links to the reports section of the dashboard and is never
 * marked current.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: BarChart3Icon },
      { title: "Reports", href: "/#reports", icon: FileBarChartIcon },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanbanIcon },
      { title: "Settings", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type Crumb = { label: string; href?: string };

export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/") {
    return [{ label: "Analytics", href: "/" }, { label: "Overview" }];
  }
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }];
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }];
  }
  return [{ label: "Lumen", href: "/" }];
}
