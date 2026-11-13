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
  summary: string;
  detail: string;
  date: string;
};

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const roles: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const roleDescriptions: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manages members, projects and integrations.",
  Member: "Can create and edit issues, dashboards and reports.",
  Viewer: "Read-only access to dashboards and issues.",
};

export const initialMembers: Member[] = [
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
    {
      id: "a-01-1",
      summary: "Updated workspace billing contact",
      detail: "Billing → Acme Labs, Inc.",
      date: "2026-02-10",
    },
    {
      id: "a-01-2",
      summary: "Promoted Daniel Reyes to Admin",
      detail: "Team → Roles",
      date: "2025-12-02",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q1 retention” dashboard",
      detail: "Analytics → Dashboards",
      date: "2025-11-18",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed LUM-482 “Funnel chart drops the last step”",
      detail: "Issues → Web app",
      date: "2026-02-12",
    },
    {
      id: "a-02-2",
      summary: "Connected the GitHub integration",
      detail: "Settings → Integrations",
      date: "2026-02-06",
    },
    {
      id: "a-02-3",
      summary: "Invited Hana Sato as a Member",
      detail: "Team → Invitations",
      date: "2026-01-28",
    },
    {
      id: "a-02-4",
      summary: "Shared the “Signup conversion” report with the team",
      detail: "Analytics → Reports",
      date: "2026-01-15",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Opened LUM-497 “Export CSV times out on large projects”",
      detail: "Issues → Web app",
      date: "2026-02-11",
    },
    {
      id: "a-03-2",
      summary: "Commented on LUM-482",
      detail: "Issues → Web app",
      date: "2026-02-09",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Added the “Checkout” event to the tracking plan",
      detail: "Analytics → Events",
      date: "2026-02-08",
    },
    {
      id: "a-04-2",
      summary: "Resolved LUM-455 “Session replay skips idle time”",
      detail: "Issues → Mobile app",
      date: "2026-01-30",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Weekly active teams” dashboard",
      detail: "Analytics → Dashboards",
      date: "2026-02-12",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Access suspended by Maya Okafor",
      detail: "Team → Members",
      date: "2026-01-09",
    },
    {
      id: "a-07-2",
      summary: "Resolved LUM-431 “Tooltip clipped on narrow screens”",
      detail: "Issues → Web app",
      date: "2025-12-19",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return initialMembers.find((member) => member.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activity[id] ?? [];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase();
}

/** Formats an ISO date (YYYY-MM-DD) deterministically, so server and client agree. */
export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  const months = [
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
  return `${months[month - 1]} ${day}, ${year}`;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}
