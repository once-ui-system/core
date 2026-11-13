import type { IconName } from "@once-ui-system/core";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
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

export type NavLeaf = { label: string; href: string; icon: IconName };
export type NavGroupDef = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const navGroups: NavGroupDef[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "home" },
      { label: "Reports", href: "/#reports", icon: "document" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects", icon: "folder" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));

export const stats = {
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  active: projects.filter((p) => p.status === "Active").length,
  paused: projects.filter((p) => p.status === "Paused").length,
  lastUpdate: projects.reduce((latest, p) => (p.updated > latest ? p.updated : latest), ""),
};
