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
  cadence: string
  owner: string
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
]

export const reports: Report[] = [
  {
    id: "RPT-1",
    name: "Weekly issue throughput",
    cadence: "Weekly, Monday",
    owner: "Maya Okafor",
    lastRun: "2026-10-12",
  },
  {
    id: "RPT-2",
    name: "Issue age by project",
    cadence: "Monthly",
    owner: "Maya Okafor",
    lastRun: "2026-10-01",
  },
  {
    id: "RPT-3",
    name: "Customer app release readiness",
    cadence: "On demand",
    owner: "Maya Okafor",
    lastRun: "2026-10-14",
  },
  {
    id: "RPT-4",
    name: "Public API error budget",
    cadence: "Daily",
    owner: "Maya Okafor",
    lastRun: "2026-10-14",
  },
]
