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

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const INVITE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, billing and workspace deletion.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit issues, dashboards and reports.",
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
    { id: "a2", text: "Promoted Daniel Reyes to Admin", when: "1 week ago" },
    { id: "a3", text: "Created the dashboard “Weekly retention”", when: "2 weeks ago" },
  ],
  "m-02": [
    { id: "a1", text: "Closed issue LUM-214 “Funnel chart drops last day”", when: "3 hours ago" },
    { id: "a2", text: "Connected the GitHub integration to 2 repositories", when: "Yesterday" },
    { id: "a3", text: "Invited Hana Sato as Member", when: "4 days ago" },
    { id: "a4", text: "Commented on LUM-198 “Export CSV times out”", when: "6 days ago" },
    { id: "a5", text: "Created the dashboard “Activation by cohort”", when: "2 weeks ago" },
  ],
  "m-03": [
    { id: "a1", text: "Opened issue LUM-221 “Segment filter resets on reload”", when: "Yesterday" },
    { id: "a2", text: "Shared the report “Feature adoption Q2”", when: "5 days ago" },
    { id: "a3", text: "Edited the dashboard “Weekly retention”", when: "1 week ago" },
  ],
  "m-04": [
    { id: "a1", text: "Resolved issue LUM-209 “Wrong timezone in event log”", when: "2 days ago" },
    { id: "a2", text: "Added 3 new event definitions", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "a1", text: "Viewed the dashboard “Weekly retention”", when: "3 days ago" },
    { id: "a2", text: "Viewed the report “Feature adoption Q2”", when: "1 week ago" },
  ],
  "m-07": [
    { id: "a1", text: "Account suspended by Maya Okafor", when: "3 weeks ago" },
    { id: "a2", text: "Commented on LUM-172 “Slow query on events page”", when: "1 month ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
