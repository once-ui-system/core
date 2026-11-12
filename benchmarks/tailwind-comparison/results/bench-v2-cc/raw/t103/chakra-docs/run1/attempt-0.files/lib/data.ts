export type ProjectStatus = "Active" | "Paused" | "Archived"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export interface Report {
  id: string
  name: string
  description: string
  cadence: "Daily" | "Weekly" | "Monthly"
  lastRun: string
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams"

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
}

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export const reports: Report[] = [
  {
    id: "throughput",
    name: "Weekly issue throughput",
    description: "Issues opened and closed per project, compared with the previous week.",
    cadence: "Weekly",
    lastRun: "2026-10-12",
  },
  {
    id: "digest",
    name: "Project activity digest",
    description: "What changed across your projects in the last 24 hours.",
    cadence: "Daily",
    lastRun: "2026-10-14",
  },
  {
    id: "aging",
    name: "Issue aging",
    description: "Open issues grouped by how long they have been waiting.",
    cadence: "Weekly",
    lastRun: "2026-10-12",
  },
  {
    id: "readiness",
    name: "Release readiness",
    description: "Open blockers and unfinished work for the next release.",
    cadence: "Monthly",
    lastRun: "2026-10-01",
  },
]

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** Deterministic (UTC) date label so server and client render the same text. */
export function formatDate(iso: string): string {
  return dateFormat.format(new Date(`${iso}T00:00:00Z`))
}

export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName
}

export const totalIssues = projects.reduce((sum, p) => sum + p.issues, 0)
export const activeProjects = projects.filter((p) => p.status === "Active")
export const projectsByUpdate = [...projects].sort((a, b) =>
  b.updated.localeCompare(a.updated),
)
export const busiestProject = projects.reduce((top, p) =>
  p.issues > top.issues ? p : top,
)
