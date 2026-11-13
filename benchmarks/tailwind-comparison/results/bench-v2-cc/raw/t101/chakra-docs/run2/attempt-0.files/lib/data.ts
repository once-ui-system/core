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
  period: string
  owner: string
  generated: string
}

export const reports: Report[] = [
  { name: "Weekly issue throughput", period: "6 Oct to 12 Oct 2026", owner: "Maya Okafor", generated: "2026-10-13" },
  { name: "Active users by project", period: "September 2026", owner: "Maya Okafor", generated: "2026-10-01" },
  { name: "Cycle time by status", period: "Q3 2026", owner: "Maya Okafor", generated: "2026-10-02" },
  { name: "Archived project summary", period: "Q3 2026", owner: "Maya Okafor", generated: "2026-09-30" },
]

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
