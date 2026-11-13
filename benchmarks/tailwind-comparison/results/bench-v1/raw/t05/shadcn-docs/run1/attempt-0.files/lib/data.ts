export const ROLES = ["Owner", "Admin", "Member", "Viewer"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["Active", "Invited", "Suspended"] as const;
export type Status = (typeof STATUSES)[number];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string | null;
};

export type Activity = {
  id: string;
  action: string;
  target: string;
  when: string;
};

export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
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

const ACTIVITY: Record<string, Activity[]> = {
  "m-01": [
    { id: "a1", action: "Updated billing plan to", target: "Team (10 seats)", when: "2 days ago" },
    { id: "a2", action: "Promoted Daniel Reyes to", target: "Admin", when: "3 weeks ago" },
    { id: "a3", action: "Created dashboard", target: "Weekly activation funnel", when: "1 month ago" },
  ],
  "m-02": [
    { id: "b1", action: "Resolved issue", target: "LUM-482 Funnel chart drops last day of range", when: "3 hours ago" },
    { id: "b2", action: "Invited Hana Sato as", target: "Member", when: "Yesterday" },
    { id: "b3", action: "Created dashboard", target: "Retention by signup cohort", when: "4 days ago" },
    { id: "b4", action: "Commented on", target: "LUM-471 Slow event ingestion on large workspaces", when: "1 week ago" },
    { id: "b5", action: "Changed role of Leo Brandt to", target: "Member", when: "3 weeks ago" },
  ],
  "m-03": [
    { id: "c1", action: "Opened issue", target: "LUM-490 Export to CSV ignores filters", when: "5 hours ago" },
    { id: "c2", action: "Commented on", target: "LUM-482 Funnel chart drops last day of range", when: "Yesterday" },
    { id: "c3", action: "Saved report", target: "Feature adoption by plan", when: "6 days ago" },
  ],
  "m-04": [
    { id: "d1", action: "Closed issue", target: "LUM-476 Tooltip clipped on mobile charts", when: "2 days ago" },
    { id: "d2", action: "Opened issue", target: "LUM-488 Add dark mode to shared dashboards", when: "1 week ago" },
  ],
  "m-05": [],
  "m-06": [
    { id: "f1", action: "Viewed dashboard", target: "Weekly activation funnel", when: "Yesterday" },
    { id: "f2", action: "Viewed report", target: "Feature adoption by plan", when: "1 week ago" },
  ],
  "m-07": [
    { id: "g1", action: "Account suspended by", target: "Daniel Reyes", when: "2 weeks ago" },
    { id: "g2", action: "Resolved issue", target: "LUM-455 Duplicate events from retry logic", when: "3 weeks ago" },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function getActivity(id: string): Activity[] {
  return ACTIVITY[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatJoined(joined: string | null): string {
  if (!joined) return "Not joined yet";
  const [year, month, day] = joined.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, including billing and workspace deletion.",
  Admin: "Manage members, projects and integrations.",
  Member: "Create and edit dashboards, reports and issues.",
  Viewer: "Read-only access to dashboards and issues.",
};
