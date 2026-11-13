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
  detail?: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";
export const WORKSPACE_NAME = "Acme Labs";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full control of the workspace, billing and members.",
  Admin: "Manages projects, integrations and team members.",
  Member: "Creates and triages issues, and views analytics.",
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
    {
      id: "a-01-1",
      text: "Updated the workspace billing plan",
      detail: "Switched to the Team plan, 10 seats",
      when: "2 days ago",
    },
    {
      id: "a-01-2",
      text: "Changed Daniel Reyes's role to Admin",
      when: "last week",
    },
    {
      id: "a-01-3",
      text: "Created the dashboard “Weekly activation”",
      when: "3 weeks ago",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      text: "Resolved issue LUM-214",
      detail: "Funnel chart drops events after midnight UTC",
      when: "3 hours ago",
    },
    {
      id: "a-02-2",
      text: "Connected the GitHub integration",
      detail: "Repository acmelabs/web-app",
      when: "yesterday",
    },
    {
      id: "a-02-3",
      text: "Invited Hana Sato as Member",
      when: "4 days ago",
    },
    {
      id: "a-02-4",
      text: "Commented on LUM-198",
      detail: "“Let's sample session replays at 20% for now.”",
      when: "last week",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      text: "Opened issue LUM-221",
      detail: "Retention cohort export is missing the signup week",
      when: "yesterday",
    },
    {
      id: "a-03-2",
      text: "Saved the report “Checkout drop-off by plan”",
      when: "5 days ago",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      text: "Closed issue LUM-207",
      detail: "Tooltip overlaps legend on narrow screens",
      when: "2 days ago",
    },
    {
      id: "a-04-2",
      text: "Added 3 labels to LUM-219",
      when: "last week",
    },
  ],
  "m-05": [
    {
      id: "a-05-1",
      text: "Invitation sent by Daniel Reyes",
      detail: "Waiting for Hana to accept",
      when: "4 days ago",
    },
  ],
  "m-06": [
    {
      id: "a-06-1",
      text: "Viewed the dashboard “Weekly activation”",
      when: "this morning",
    },
    {
      id: "a-06-2",
      text: "Viewed issue LUM-214",
      when: "3 days ago",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      text: "Account suspended by Maya Okafor",
      detail: "Pending a security review of the shared API key",
      when: "2 weeks ago",
    },
    {
      id: "a-07-2",
      text: "Opened issue LUM-188",
      detail: "Alert rules fire twice for the same threshold",
      when: "3 weeks ago",
    },
  ],
  "m-08": [
    {
      id: "a-08-1",
      text: "Invitation sent by Maya Okafor",
      detail: "Waiting for Ines to accept",
      when: "yesterday",
    },
  ],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getActivity(id: string): ActivityItem[] {
  return activityByMember[id] ?? [];
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
