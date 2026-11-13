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

export const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

/** "2026-10-14" -> "14 Oct 2026". Fixed locale and UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };
export type NavEntry = NavLink | NavGroupDef;

export const nav: NavEntry[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
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

export function isGroup(entry: NavEntry): entry is NavGroupDef {
  return "items" in entry;
}

export const navLinks: NavLink[] = nav.flatMap((entry) => (isGroup(entry) ? entry.items : [entry]));

export const summary = {
  openIssues: projects.reduce((total, p) => total + p.issues, 0),
  activeProjects: projects.filter((p) => p.status === "Active").length,
  totalProjects: projects.length,
  lastUpdated: projects.reduce((latest, p) => (p.updated > latest ? p.updated : latest), ""),
};

export const recentActivity = [
  { id: "a1", text: "Issue APP-142 moved to In review", when: "Today" },
  { id: "a2", text: "WEB-57 closed by Dan Whitfield", when: "Yesterday" },
  { id: "a3", text: "API-23 flagged as high priority", when: "12 Oct" },
];
