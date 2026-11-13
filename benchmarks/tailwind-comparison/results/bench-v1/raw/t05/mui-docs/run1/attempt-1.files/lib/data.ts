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
  action: string;
  target: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

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
    {
      id: "a1",
      action: "Updated billing plan to",
      target: "Team (10 seats)",
      when: "2 days ago",
    },
    {
      id: "a2",
      action: "Created dashboard",
      target: "Weekly activation funnel",
      when: "4 days ago",
    },
    {
      id: "a3",
      action: "Changed role of Daniel Reyes to",
      target: "Admin",
      when: "3 weeks ago",
    },
  ],
  "m-02": [
    {
      id: "a1",
      action: "Closed issue",
      target: "LUM-214 Funnel chart drops last day of data",
      when: "3 hours ago",
    },
    {
      id: "a2",
      action: "Created segment",
      target: "Trial users, last 14 days",
      when: "Yesterday",
    },
    {
      id: "a3",
      action: "Commented on",
      target: "LUM-231 Slack alerts fire twice",
      when: "2 days ago",
    },
    {
      id: "a4",
      action: "Invited Hana Sato as",
      target: "Member",
      when: "5 days ago",
    },
    {
      id: "a5",
      action: "Connected integration",
      target: "GitHub (acme-labs/web)",
      when: "2 weeks ago",
    },
  ],
  "m-03": [
    {
      id: "a1",
      action: "Opened issue",
      target: "LUM-240 Retention cohort export is empty",
      when: "Yesterday",
    },
    {
      id: "a2",
      action: "Edited dashboard",
      target: "Onboarding health",
      when: "3 days ago",
    },
  ],
  "m-04": [
    {
      id: "a1",
      action: "Closed issue",
      target: "LUM-222 Event schema validation errors",
      when: "Today",
    },
    {
      id: "a2",
      action: "Merged pull request",
      target: "#418 Batch event ingestion",
      when: "2 days ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a1",
      action: "Viewed dashboard",
      target: "Weekly activation funnel",
      when: "Yesterday",
    },
  ],
  "m-07": [
    {
      id: "a1",
      action: "Account suspended by",
      target: "Maya Okafor",
      when: "6 days ago",
    },
    {
      id: "a2",
      action: "Opened issue",
      target: "LUM-198 Session replay stalls on Safari",
      when: "3 weeks ago",
    },
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
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
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

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}
