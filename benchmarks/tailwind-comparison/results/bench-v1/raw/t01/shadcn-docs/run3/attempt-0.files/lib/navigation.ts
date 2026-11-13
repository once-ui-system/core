import {
  BarChart3,
  FileText,
  FolderKanban,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * "Overview" and "Reports" live in the Analytics group. The dashboard at `/`
 * is the Overview screen; Reports has no dedicated screen in this shell, so it
 * resolves to the dashboard route as well but is never highlighted over it.
 */
export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { title: "Overview", href: "/", icon: BarChart3 },
      { title: "Reports", href: "/#reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export interface Crumb {
  group: string;
  title: string;
}

export function getCrumb(pathname: string): Crumb {
  if (pathname.startsWith("/projects"))
    return { group: "Workspace", title: "Projects" };
  if (pathname.startsWith("/settings"))
    return { group: "Workspace", title: "Settings" };
  return { group: "Analytics", title: "Overview" };
}

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.title === "Reports") return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
