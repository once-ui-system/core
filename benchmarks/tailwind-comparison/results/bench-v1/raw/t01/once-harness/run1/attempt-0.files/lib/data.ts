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
export type NavEntry = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavEntry[] = [
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

export const navLinks: NavLink[] = nav.flatMap((entry) => entry.items);

export type SummaryCard = {
  label: string;
  value: string;
  note: string;
  icon: IconName;
  href: string;
};

const activeProjects = projects.filter((p) => p.status === "Active");
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);

export const summaryCards: SummaryCard[] = [
  {
    label: "Open issues",
    value: String(openIssues),
    note: `Across ${projects.length} projects`,
    icon: "clipboard",
    href: "/projects",
  },
  {
    label: "Active projects",
    value: String(activeProjects.length),
    note: "1 paused, 1 archived",
    icon: "folder",
    href: "/projects",
  },
  {
    label: "Weekly active users",
    value: "2,418",
    note: "Up 6.2% from last week",
    icon: "trendUp",
    href: "/reports",
  },
  {
    label: "Median time to close",
    value: "3.4 days",
    note: "Down from 4.1 days",
    icon: "time",
    href: "/reports",
  },
];

export const recentActivity = [
  { id: "a1", text: "APP-214 moved to In review", who: "Daniel Reyes", when: "2 hours ago" },
  { id: "a2", text: "WEB-87 closed as fixed", who: "Priya Nair", when: "Yesterday" },
  { id: "a3", text: "API-33 assigned to you", who: "Tom Becker", when: "Yesterday" },
  { id: "a4", text: "Mobile beta paused", who: "Maya Okafor", when: "Sep 28" },
];

export const reportsList = [
  { id: "r1", title: "Weekly activation funnel", detail: "Sign-up to first project, last 7 days", updated: "2026-10-14" },
  { id: "r2", title: "Issue throughput", detail: "Opened versus closed per week", updated: "2026-10-13" },
  { id: "r3", title: "Feature adoption", detail: "Share of teams using each feature", updated: "2026-10-10" },
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}
