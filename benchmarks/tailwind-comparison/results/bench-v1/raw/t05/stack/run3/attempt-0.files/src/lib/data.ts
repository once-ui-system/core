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
  date: string;
};

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
};

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const inviteRoles: Role[] = ["Admin", "Member", "Viewer"];

export const roleDescriptions: Record<Role, string> = {
  Owner: "Full control, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Creates and edits issues, dashboards and reports.",
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

export const activity: Record<string, ActivityItem[]> = {
  "m-01": [
    { id: "a1", text: "Updated the workspace billing plan to Team", date: "2025-09-12" },
    { id: "a2", text: "Invited Ines Duarte as a Viewer", date: "2025-09-10" },
    { id: "a3", text: "Created the dashboard “Weekly retention”", date: "2025-09-04" },
  ],
  "m-02": [
    { id: "a1", text: "Changed Leo Brandt's access to Suspended", date: "2025-09-11" },
    { id: "a2", text: "Closed issue LUM-214 “Funnel chart misses the last step”", date: "2025-09-09" },
    { id: "a3", text: "Connected the GitHub integration to the web-app project", date: "2025-08-29" },
    { id: "a4", text: "Invited Hana Sato as a Member", date: "2025-08-21" },
  ],
  "m-03": [
    { id: "a1", text: "Commented on LUM-231 “Session replay stutters on Safari”", date: "2025-09-12" },
    { id: "a2", text: "Opened issue LUM-236 “Export CSV drops empty columns”", date: "2025-09-08" },
    { id: "a3", text: "Shared the report “Onboarding drop-off”", date: "2025-09-02" },
  ],
  "m-04": [
    { id: "a1", text: "Moved LUM-229 to In review", date: "2025-09-11" },
    { id: "a2", text: "Created the event definition “project_created”", date: "2025-09-05" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the dashboard “Weekly retention”", date: "2025-09-12" },
    { id: "a2", text: "Viewed issue LUM-231", date: "2025-09-09" },
  ],
  "m-07": [
    { id: "a1", text: "Reopened issue LUM-198 “Alerts fire twice”", date: "2025-08-30" },
    { id: "a2", text: "Edited the saved view “Open bugs, this sprint”", date: "2025-08-26" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
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

export const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "accent",
  Admin: "brand",
  Member: "info",
  Viewer: "neutral",
};

export const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
