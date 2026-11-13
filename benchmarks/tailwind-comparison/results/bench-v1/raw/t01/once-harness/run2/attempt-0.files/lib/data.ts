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

export type NavLink = { href: string; label: string; icon: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

export const navGroups: NavGroupDef[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview", icon: "home" },
      { href: "/reports", label: "Reports", icon: "document" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects", icon: "folder" },
      { href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((g) => g.items);

export const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export const statusTone = (status: ProjectStatus): "success" | "warning" | "neutral" =>
  status === "Active" ? "success" : status === "Paused" ? "warning" : "neutral";

export const summary = [
  { label: "Open issues", value: projects.reduce((n, p) => n + p.issues, 0), hint: "Across 5 projects", icon: "inbox" as const },
  { label: "Active projects", value: projects.filter((p) => p.status === "Active").length, hint: "1 paused, 1 archived", icon: "folder" as const },
  { label: "Weekly active users", value: 1284, hint: "+6.2% vs last week", icon: "people" as const },
  { label: "Median time to fix", value: "2.4 days", hint: "Down from 3.1 days", icon: "time" as const },
];

export const recentActivity = [
  { text: "Customer app: 3 issues closed", when: "Oct 14, 2026" },
  { text: "Marketing site: pricing page published", when: "Oct 12, 2026" },
  { text: "Public API: rate-limit issue opened", when: "Oct 9, 2026" },
];
