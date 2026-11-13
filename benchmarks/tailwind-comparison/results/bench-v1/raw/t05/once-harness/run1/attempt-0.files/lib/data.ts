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

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control, including billing and deleting the workspace.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
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

export type Activity = {
  id: string;
  icon: "bolt" | "chat" | "barChart" | "flag" | "people" | "settings" | "mail" | "lock";
  text: string;
  when: string;
};

const ACTIVITY: Record<string, Activity[]> = {
  "m-01": [
    { id: "a1", icon: "settings", text: "Updated the workspace billing plan to Team", when: "2 days ago" },
    { id: "a2", icon: "people", text: "Invited Ines Duarte as Viewer", when: "4 days ago" },
    { id: "a3", icon: "barChart", text: "Shared the “Weekly retention” dashboard", when: "last week" },
  ],
  "m-02": [
    { id: "a1", icon: "flag", text: "Closed issue LUM-212 “Funnel chart drops last step”", when: "3 hours ago" },
    { id: "a2", icon: "people", text: "Changed Leo Brandt's access to Suspended", when: "yesterday" },
    { id: "a3", icon: "bolt", text: "Connected the GitHub integration to the Web app project", when: "3 days ago" },
    { id: "a4", icon: "chat", text: "Commented on LUM-198 “Export CSV times out”", when: "last week" },
  ],
  "m-03": [
    { id: "a1", icon: "barChart", text: "Created the “Activation by cohort” report", when: "yesterday" },
    { id: "a2", icon: "flag", text: "Opened issue LUM-221 “Session replay missing clicks”", when: "2 days ago" },
    { id: "a3", icon: "chat", text: "Commented on LUM-205 “Dark mode contrast”", when: "5 days ago" },
  ],
  "m-04": [
    { id: "a1", icon: "flag", text: "Moved LUM-217 to In review", when: "5 hours ago" },
    { id: "a2", icon: "bolt", text: "Pushed a fix linked to LUM-209", when: "2 days ago" },
  ],
  "m-05": [
    { id: "a1", icon: "mail", text: "Invitation sent by Daniel Reyes", when: "3 days ago" },
  ],
  "m-06": [
    { id: "a1", icon: "barChart", text: "Viewed the “Weekly retention” dashboard", when: "this morning" },
    { id: "a2", icon: "barChart", text: "Viewed the “Activation by cohort” report", when: "last week" },
  ],
  "m-07": [
    { id: "a1", icon: "lock", text: "Access suspended by Daniel Reyes", when: "yesterday" },
    { id: "a2", icon: "flag", text: "Opened issue LUM-190 “Alert emails delayed”", when: "3 weeks ago" },
  ],
  "m-08": [
    { id: "a1", icon: "mail", text: "Invitation sent by Maya Okafor", when: "4 days ago" },
  ],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): Activity[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
