export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Route that makes this item current. Items without a route are anchors. */
  route?: string;
  icon: "overview" | "reports" | "projects" | "settings";
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
      { id: "overview", label: "Overview", href: "/", route: "/", icon: "overview" },
      { id: "reports", label: "Reports", href: "/#reports", icon: "reports" },
    ],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "projects", label: "Projects", href: "/projects", route: "/projects", icon: "projects" },
      { id: "settings", label: "Settings", href: "/settings", route: "/settings", icon: "settings" },
    ],
  },
];

export function findCurrent(pathname: string): { group: NavGroup; item: NavItem } | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.route === pathname) return { group, item };
    }
  }
  return null;
}
