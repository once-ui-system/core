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
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export interface Report {
  name: string;
  description: string;
  cadence: string;
  lastRun: string;
}

export const reports: Report[] = [
  {
    name: "Issue throughput",
    description: "Issues opened and closed per project, by week.",
    cadence: "Weekly",
    lastRun: "2026-10-13",
  },
  {
    name: "Open issues by project",
    description: "Open issue count for every active and paused project.",
    cadence: "Daily",
    lastRun: "2026-10-14",
  },
  {
    name: "Team activity",
    description: "Comments, status changes and assignments per member.",
    cadence: "Monthly",
    lastRun: "2026-10-01",
  },
];

/** Dates are fixed ISO strings; format in UTC so server and client agree. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
