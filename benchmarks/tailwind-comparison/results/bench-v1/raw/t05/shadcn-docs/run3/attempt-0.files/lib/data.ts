export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  /** ISO date (YYYY-MM-DD) or null when the invite has not been accepted. */
  joined: string | null;
}

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

export const MEMBERS: Member[] = [
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
];

const ACTIVITY: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", action: "Updated billing plan to", target: "Team (annual)", when: "2 days ago" },
    { id: "a2", action: "Invited", target: "ines@acmelabs.io", when: "5 days ago" },
    { id: "a3", action: "Created project", target: "Checkout funnel", when: "2 weeks ago" },
  ],
  "m-02": [
    { id: "a1", action: "Closed issue", target: "LUM-214 Funnel chart drops last step", when: "3 hours ago" },
    { id: "a2", action: "Changed role of Leo Brandt to", target: "Member", when: "Yesterday" },
    { id: "a3", action: "Connected integration", target: "GitHub: acme-labs/web", when: "4 days ago" },
    { id: "a4", action: "Published dashboard", target: "Weekly retention", when: "1 week ago" },
    { id: "a5", action: "Commented on", target: "LUM-198 Slow session replay load", when: "2 weeks ago" },
  ],
  "m-03": [
    { id: "a1", action: "Opened issue", target: "LUM-221 Export CSV misses timezone column", when: "Yesterday" },
    { id: "a2", action: "Edited dashboard", target: "Activation metrics", when: "3 days ago" },
  ],
  "m-04": [
    { id: "a1", action: "Merged fix for", target: "LUM-209 Duplicate events on retry", when: "Today" },
    { id: "a2", action: "Commented on", target: "LUM-214 Funnel chart drops last step", when: "2 days ago" },
    { id: "a3", action: "Created report", target: "Mobile crash rate", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", action: "Viewed dashboard", target: "Weekly retention", when: "Yesterday" },
    { id: "a2", action: "Viewed issue", target: "LUM-221 Export CSV misses timezone column", when: "4 days ago" },
  ],
  "m-07": [
    { id: "a1", action: "Account suspended by", target: "Daniel Reyes", when: "3 weeks ago" },
    { id: "a2", action: "Closed issue", target: "LUM-176 Tooltip clipped on small screens", when: "1 month ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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
];

/** Formats an ISO date (YYYY-MM-DD) deterministically, e.g. "19 May 2024". */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
