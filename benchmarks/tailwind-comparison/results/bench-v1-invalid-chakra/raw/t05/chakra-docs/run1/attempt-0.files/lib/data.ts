export type Role = "Owner" | "Admin" | "Member" | "Viewer";
export type Status = "Active" | "Invited" | "Suspended";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
}

export interface ActivityItem {
  id: string;
  text: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const INVITE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

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

const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated the workspace billing plan to Team", when: "2 days ago" },
    { id: "a2", text: "Created the “Q3 retention” dashboard", when: "5 days ago" },
    { id: "a3", text: "Invited Ines Duarte as Viewer", when: "1 week ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-214 “Funnel chart drops last day”", when: "3 hours ago" },
    { id: "a2", text: "Changed Leo Brandt's access to Suspended", when: "Yesterday" },
    { id: "a3", text: "Connected the GitHub integration", when: "4 days ago" },
    { id: "a4", text: "Commented on LUM-231 “Export CSV times out”", when: "6 days ago" },
  ],
  "m-03": [
    { id: "a1", text: "Opened issue LUM-238 “Cohort filter resets on refresh”", when: "Yesterday" },
    { id: "a2", text: "Shared the “Onboarding funnel” report", when: "3 days ago" },
  ],
  "m-04": [
    { id: "a1", text: "Merged a fix linked to LUM-219", when: "6 hours ago" },
    { id: "a2", text: "Added a new event, “project_archived”", when: "4 days ago" },
    { id: "a3", text: "Commented on LUM-225 “Slow dashboard load”", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the “Weekly active teams” dashboard", when: "Today" },
    { id: "a2", text: "Viewed issue LUM-214", when: "3 days ago" },
  ],
  "m-07": [
    { id: "a1", text: "Last active in the workspace", when: "3 weeks ago" },
    { id: "a2", text: "Reassigned LUM-190 to Tomás Lindqvist", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
}

export function statusColor(status: Status): "green" | "orange" | "red" {
  if (status === "Active") return "green";
  if (status === "Invited") return "orange";
  return "red";
}

export function roleColor(role: Role): "purple" | "blue" | "gray" | "cyan" {
  if (role === "Owner") return "purple";
  if (role === "Admin") return "blue";
  if (role === "Member") return "cyan";
  return "gray";
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
