import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { label: string; icon: IconName; items: NavLink[] };

/**
 * The app serves three routes. "Overview" is the dashboard at "/"; "Reports"
 * is the issue ledger at "/projects" read as a report, so it shares that route
 * with "Projects" (carrying a fragment) and is never a dead link.
 */
export const nav: NavGroupEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/projects#reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

/** Breadcrumb trail for each real route. */
export const routeTrail: Record<string, { group?: string; page: string }> = {
  "/": { group: "Analytics", page: "Overview" },
  "/projects": { group: "Workspace", page: "Projects" },
  "/settings": { group: "Workspace", page: "Settings" },
};

export const totals = {
  active: projects.filter((p) => p.status === "Active").length,
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  projects: projects.length,
};

export const summaryCards: {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[] = [
  {
    label: "Open issues",
    value: String(totals.openIssues),
    note: "Across all projects",
    icon: "flag",
  },
  {
    label: "Active projects",
    value: String(totals.active),
    note: `${totals.projects} projects in total`,
    icon: "folder",
  },
  {
    label: "Busiest project",
    value: "APP",
    note: "Customer app, 31 open issues",
    icon: "trendUp",
  },
  {
    label: "Last updated",
    value: "14 Oct",
    note: "Customer app, 2026",
    icon: "calendar",
  },
];

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[month - 1]} ${year}`;
}
