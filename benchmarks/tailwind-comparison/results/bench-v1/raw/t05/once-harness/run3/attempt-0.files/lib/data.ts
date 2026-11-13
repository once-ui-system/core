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

export type Activity = {
  id: string;
  summary: string;
  detail: string;
  date: string;
};

export const PRODUCT = "Lumen";
export const PRODUCT_DESCRIPTION =
  "Lumen is a product-analytics and issue-tracking app for small software teams.";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
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

export const activity: Record<string, Activity[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated the workspace billing plan",
      detail: "Switched Acme Labs to the Team plan, billed annually.",
      date: "2026-03-12",
    },
    {
      id: "a-01-2",
      summary: "Invited Ines Duarte as Viewer",
      detail: "Invitation sent to ines@acmelabs.io.",
      date: "2026-03-09",
    },
    {
      id: "a-01-3",
      summary: "Created the “Q2 retention” dashboard",
      detail: "Added 6 charts covering weekly active teams and churn.",
      date: "2026-03-02",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed 4 issues in Checkout flow",
      detail: "Resolved LUM-482, LUM-487, LUM-491 and LUM-495 after the payment retry fix.",
      date: "2026-03-14",
    },
    {
      id: "a-02-2",
      summary: "Changed Leo Brandt's access to Suspended",
      detail: "Access paused pending a contractor agreement renewal.",
      date: "2026-03-11",
    },
    {
      id: "a-02-3",
      summary: "Connected the GitHub integration",
      detail: "Linked the acme-labs/web repository to the issue tracker.",
      date: "2026-03-05",
    },
    {
      id: "a-02-4",
      summary: "Saved a funnel report: Signup to first event",
      detail: "Conversion is 61% over the last 30 days.",
      date: "2026-02-27",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-503",
      detail: "Suggested grouping crash events by app version.",
      date: "2026-03-13",
    },
    {
      id: "a-03-2",
      summary: "Opened 2 issues in Onboarding",
      detail: "LUM-510 and LUM-511 cover the empty-state copy.",
      date: "2026-03-08",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Shipped the session replay filter",
      detail: "Merged the filter by country and browser into the replay list.",
      date: "2026-03-10",
    },
    {
      id: "a-04-2",
      summary: "Assigned LUM-498 to Priya Natarajan",
      detail: "Bug: chart tooltips clip on narrow screens.",
      date: "2026-03-04",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed the “Weekly product health” dashboard",
      detail: "Opened from a shared link sent by Maya Okafor.",
      date: "2026-03-12",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Last active: updated LUM-455",
      detail: "Moved the issue from In progress to In review.",
      date: "2026-02-18",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const STATUS_TONE: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export const ROLE_TONE: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "brand",
  Admin: "accent",
  Member: "neutral",
  Viewer: "info",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}
