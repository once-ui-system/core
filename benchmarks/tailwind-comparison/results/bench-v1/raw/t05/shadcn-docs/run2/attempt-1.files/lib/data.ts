export type Role = "Owner" | "Admin" | "Member" | "Viewer"
export type Status = "Active" | "Invited" | "Suspended"

export type Member = {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  joined: string | null
}

export type ActivityItem = {
  id: string
  summary: string
  detail: string
  date: string
}

export const PRODUCT_NAME = "Lumen"
export const PRODUCT_TAGLINE =
  "Product analytics and issue tracking for small software teams"

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"]
export const INVITABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"]

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control, including billing and workspace deletion.",
  Admin: "Manages members, projects and integrations.",
  Member: "Creates and edits dashboards, issues and reports.",
  Viewer: "Read-only access to dashboards and issues.",
}

export const members: Member[] = [
  {
    id: "m-01",
    name: "Maya Okafor",
    email: "maya@acmelabs.io",
    role: "Owner",
    status: "Active",
    joined: "2024-03-02",
  },
  {
    id: "m-02",
    name: "Daniel Reyes",
    email: "daniel@acmelabs.io",
    role: "Admin",
    status: "Active",
    joined: "2024-05-19",
  },
  {
    id: "m-03",
    name: "Priya Natarajan",
    email: "priya@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2024-11-07",
  },
  {
    id: "m-04",
    name: "Tomás Lindqvist",
    email: "tomas@acmelabs.io",
    role: "Member",
    status: "Active",
    joined: "2025-02-14",
  },
  {
    id: "m-05",
    name: "Hana Sato",
    email: "hana@acmelabs.io",
    role: "Member",
    status: "Invited",
    joined: null,
  },
  {
    id: "m-06",
    name: "Grace Mensah",
    email: "grace@acmelabs.io",
    role: "Viewer",
    status: "Active",
    joined: "2025-06-30",
  },
  {
    id: "m-07",
    name: "Leo Brandt",
    email: "leo@acmelabs.io",
    role: "Member",
    status: "Suspended",
    joined: "2025-01-21",
  },
  {
    id: "m-08",
    name: "Ines Duarte",
    email: "ines@acmelabs.io",
    role: "Viewer",
    status: "Invited",
    joined: null,
  },
]

const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated workspace billing contact",
      detail: "Billing → Acme Labs finance team",
      date: "2025-09-12",
    },
    {
      id: "a-01-2",
      summary: "Promoted Daniel Reyes to Admin",
      detail: "Team settings",
      date: "2025-08-30",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q3 retention” dashboard",
      detail: "Dashboards",
      date: "2025-08-21",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed issue LUM-214 “Funnel drops on step 3”",
      detail: "Issues · Checkout funnel",
      date: "2025-09-14",
    },
    {
      id: "a-02-2",
      summary: "Connected the Slack integration",
      detail: "Integrations · #lumen-alerts",
      date: "2025-09-10",
    },
    {
      id: "a-02-3",
      summary: "Invited Hana Sato as Member",
      detail: "Team settings",
      date: "2025-09-08",
    },
    {
      id: "a-02-4",
      summary: "Edited the “Weekly active users” chart",
      detail: "Dashboards · Growth overview",
      date: "2025-09-02",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-231 “Session replay lag”",
      detail: "Issues",
      date: "2025-09-13",
    },
    {
      id: "a-03-2",
      summary: "Saved the “Onboarding completion” report",
      detail: "Reports",
      date: "2025-09-05",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Opened issue LUM-238 “CSV export times out”",
      detail: "Issues · Data exports",
      date: "2025-09-11",
    },
    {
      id: "a-04-2",
      summary: "Added a funnel to “Growth overview”",
      detail: "Dashboards",
      date: "2025-09-03",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Q3 retention” dashboard",
      detail: "Dashboards",
      date: "2025-09-09",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Account suspended by an admin",
      detail: "Team settings",
      date: "2025-08-18",
    },
    {
      id: "a-07-2",
      summary: "Resolved issue LUM-197 “Wrong timezone on weekly digest”",
      detail: "Issues",
      date: "2025-08-15",
    },
  ],
  "m-08": [],
}

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id)
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? []
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.charAt(0) ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : ""
  return (first + last).toUpperCase()
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}
