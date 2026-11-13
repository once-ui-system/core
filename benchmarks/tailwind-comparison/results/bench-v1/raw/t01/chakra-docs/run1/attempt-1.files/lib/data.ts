export type ProjectStatus = "Active" | "Paused" | "Archived"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export interface User {
  name: string
  email: string
  role: string
}

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
}

export const user: User = {
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

export const statusPalette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
}

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
]

/** Formats an ISO date (YYYY-MM-DD) deterministically, independent of locale/timezone. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  return `${MONTHS[month - 1]} ${day}, ${year}`
}

export type NavIconName = "overview" | "reports" | "projects" | "settings"

export interface NavItem {
  label: string
  /** Route to link to. Items without an href are rendered as unavailable. */
  href?: string
  icon: NavIconName
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: "overview" },
      { label: "Reports", icon: "reports" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: "projects" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
]

export interface Crumb {
  label: string
  href?: string
}

/** Breadcrumb trail for a pathname. The last crumb is the current page. */
export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname.startsWith("/projects")) {
    return [{ label: "Workspace" }, { label: "Projects" }]
  }
  if (pathname.startsWith("/settings")) {
    return [{ label: "Workspace" }, { label: "Settings" }]
  }
  return [{ label: "Analytics" }, { label: "Overview" }]
}

export interface SummaryCard {
  label: string
  value: number
  unit?: string
  help: string
  trend: "up" | "down"
  change: string
}

export const summaryCards: SummaryCard[] = [
  {
    label: "Open issues",
    value: projects.reduce((sum, p) => sum + p.issues, 0),
    help: "Across 5 projects",
    trend: "up",
    change: "8%",
  },
  {
    label: "Active projects",
    value: projects.filter((p) => p.status === "Active").length,
    help: "1 paused, 1 archived",
    trend: "up",
    change: "1 new",
  },
  {
    label: "Weekly active users",
    value: 2841,
    help: "vs. previous 7 days",
    trend: "up",
    change: "4.2%",
  },
  {
    label: "Median time to close",
    value: 3.4,
    unit: "days",
    help: "vs. previous 7 days",
    trend: "down",
    change: "0.6 d",
  },
]
