export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user: User = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const statusColor: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export type NavIconName = "overview" | "reports" | "projects" | "settings";

export interface NavItem {
  label: string;
  /** Items without an href are not available yet. */
  href?: string;
  icon: NavIconName;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export interface Crumb {
  label: string;
  href?: string;
}

export const breadcrumbs: Record<string, Crumb[]> = {
  "/": [{ label: "Analytics" }, { label: "Overview" }],
  "/projects": [{ label: "Workspace" }, { label: "Projects" }],
  "/settings": [{ label: "Workspace" }, { label: "Settings" }],
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
