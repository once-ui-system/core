export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
};

export type ActivityItem = {
  id: string;
  text: string;
  when: string;
};

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

/** Roles that can be assigned through an invitation (there is only one owner). */
export const invitableRoles: Role[] = ["Admin", "Member", "Viewer"];

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
];

const activity: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated billing details for the workspace", when: "2 hours ago" },
    { id: "a2", text: "Changed Daniel Reyes's role to Admin", when: "Yesterday" },
    { id: "a3", text: "Created the “Onboarding funnel” dashboard", when: "3 days ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-212 “Checkout events missing user id”", when: "35 minutes ago" },
    { id: "a2", text: "Invited Hana Sato as a Member", when: "Yesterday" },
    { id: "a3", text: "Shared the “Weekly retention” report with the team", when: "3 days ago" },
    { id: "a4", text: "Connected the GitHub integration", when: "Last week" },
  ],
  "m-03": [
    { id: "a1", text: "Commented on LUM-231 “Funnel drop-off at step 3”", when: "1 hour ago" },
    { id: "a2", text: "Opened issue LUM-236 “Export CSV truncates long names”", when: "Yesterday" },
    { id: "a3", text: "Saved the “Trial conversions” segment", when: "4 days ago" },
  ],
  "m-04": [
    { id: "a1", text: "Moved LUM-228 to In review", when: "Yesterday" },
    { id: "a2", text: "Added a new event property: plan_tier", when: "2 days ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the “Weekly retention” report", when: "Today" },
    { id: "a2", text: "Viewed the “Onboarding funnel” dashboard", when: "2 days ago" },
  ],
  "m-07": [
    { id: "a1", text: "Account suspended by Maya Okafor", when: "2 weeks ago" },
    { id: "a2", text: "Resolved issue LUM-190 “Session replay stalls on Safari”", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activity[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Formats an ISO date (YYYY-MM-DD) in a locale-independent way, to avoid hydration mismatches. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}

export const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "brand",
  Admin: "accent",
  Member: "neutral",
  Viewer: "info",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
