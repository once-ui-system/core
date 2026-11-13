export type ProjectStatus = "Active" | "Paused" | "Archived"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
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

export interface Report {
  name: string
  schedule: string
  recipients: number
  lastRun: string
}

export const reports: Report[] = [
  { name: "Weekly issue throughput", schedule: "Mondays, 08:00", recipients: 4, lastRun: "2026-10-12" },
  { name: "Open issues by project", schedule: "Daily, 07:30", recipients: 6, lastRun: "2026-10-14" },
  { name: "Cycle time by team", schedule: "First of the month", recipients: 3, lastRun: "2026-10-01" },
  { name: "Public API error budget", schedule: "Fridays, 16:00", recipients: 2, lastRun: "2026-10-09" },
]

// Deterministic (UTC) so server and client render the same text.
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
