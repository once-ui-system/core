import {
  ChartColumn,
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
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartColumn,
    items: [
      { label: "Overview", href: "/", icon: LayoutDashboard },
      { label: "Reports", href: "/#reports", icon: FileText },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderKanban,
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const crumbs: Record<string, string[]> = {
  "/": ["Analytics", "Overview"],
  "/projects": ["Workspace", "Projects"],
  "/settings": ["Workspace", "Settings"],
};
