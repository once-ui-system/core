import {
  Activity,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    icon: Activity,
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function breadcrumbFor(pathname: string): string[] {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href)) return [group.label, item.label];
    }
  }
  return ["Lumen"];
}
