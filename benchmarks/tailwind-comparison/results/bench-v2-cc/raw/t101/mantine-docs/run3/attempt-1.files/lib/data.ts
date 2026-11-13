export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface Report {
  name: string;
  cadence: string;
  recipients: string;
  lastRun: string;
}

export const product = "Lumen";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const workspaceName = "Acme Labs";

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export const reports: Report[] = [
  {
    name: "Weekly issue summary",
    cadence: "Mondays, 08:00",
    recipients: "Whole team",
    lastRun: "2026-10-12",
  },
  {
    name: "Open issues by project",
    cadence: "Daily, 07:30",
    recipients: "Maya Okafor",
    lastRun: "2026-10-14",
  },
  {
    name: "Paused and archived projects",
    cadence: "First of the month",
    recipients: "Owners",
    lastRun: "2026-10-01",
  },
];

// Deterministic on server and client: fixed locale and UTC.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const totalOpenIssues = projects.reduce((sum, p) => sum + p.issues, 0);
export const activeProjects = projects.filter((p) => p.status === "Active");
export const pausedProjects = projects.filter((p) => p.status === "Paused");
export const archivedProjects = projects.filter((p) => p.status === "Archived");
export const projectsByUpdated = [...projects].sort((a, b) => b.updated.localeCompare(a.updated));
export const busiestProject = [...projects].sort((a, b) => b.issues - a.issues)[0];
export const latestProject = projectsByUpdated[0];
