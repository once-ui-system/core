export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const projects: Project[] = [
  {
    key: "WEB",
    name: "Marketing site",
    status: "Active",
    issues: 12,
    updated: "2026-10-12",
  },
  {
    key: "APP",
    name: "Customer app",
    status: "Active",
    issues: 31,
    updated: "2026-10-14",
  },
  {
    key: "API",
    name: "Public API",
    status: "Active",
    issues: 9,
    updated: "2026-10-09",
  },
  {
    key: "MOB",
    name: "Mobile beta",
    status: "Paused",
    issues: 4,
    updated: "2026-09-28",
  },
  {
    key: "OPS",
    name: "Internal tools",
    status: "Archived",
    issues: 0,
    updated: "2026-08-30",
  },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Deterministic, timezone-independent date formatting (avoids hydration mismatches). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const totalOpenIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjectCount = projects.filter(
  (p) => p.status === "Active",
).length;

export const recentActivity = [
  {
    id: "a1",
    text: "APP-214 moved to In review",
    project: "Customer app",
    when: "2 hours ago",
  },
  {
    id: "a2",
    text: "WEB-87 closed by Daniel Reyes",
    project: "Marketing site",
    when: "Yesterday",
  },
  {
    id: "a3",
    text: "API-41 assigned to you",
    project: "Public API",
    when: "Oct 9",
  },
] as const;
