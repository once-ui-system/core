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
  title: string;
  detail: string;
  when: string;
}

export const PRODUCT_NAME = "Lumen";

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

/** Roles that can be assigned to someone else (there is a single Owner). */
export const ASSIGNABLE_ROLES: Role[] = ["Admin", "Member", "Viewer"];

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Owner: "Full access, billing and workspace deletion",
  Admin: "Manage members, projects and integrations",
  Member: "Create and edit issues, dashboards and reports",
  Viewer: "Read-only access to dashboards and issues",
};

export const ROLE_COLORS: Record<Role, string> = {
  Owner: "grape",
  Admin: "indigo",
  Member: "teal",
  Viewer: "gray",
};

export const STATUS_COLORS: Record<Status, string> = {
  Active: "green",
  Invited: "yellow",
  Suspended: "red",
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

export const activityByMember: Record<string, ActivityItem[]> = {
  "m-01": [
    {
      title: "Updated workspace billing plan",
      detail: "Switched Acme Labs to the Team plan with 12 seats",
      when: "Today, 09:12",
    },
    {
      title: "Created dashboard “Weekly retention”",
      detail: "Added 4 charts tracking activation and week-over-week retention",
      when: "Yesterday, 16:40",
    },
    {
      title: "Invited Ines Duarte as Viewer",
      detail: "Invitation sent to ines@acmelabs.io",
      when: "3 days ago",
    },
  ],
  "m-02": [
    {
      title: "Closed issue LUM-212 “Funnel drops off at step 3”",
      detail: "Fixed a tracking bug in the onboarding checkout events",
      when: "Today, 11:05",
    },
    {
      title: "Changed Tomás Lindqvist's role to Member",
      detail: "Role updated from Viewer to Member",
      when: "Yesterday, 14:22",
    },
    {
      title: "Connected the Slack integration",
      detail: "Daily digests now post to #product-metrics",
      when: "4 days ago",
    },
    {
      title: "Resent invitation to Hana Sato",
      detail: "Invitation sent to hana@acmelabs.io",
      when: "Last week",
    },
  ],
  "m-03": [
    {
      title: "Commented on LUM-231 “Session replay is laggy”",
      detail: "Shared a HAR export and reproduction steps",
      when: "Today, 10:31",
    },
    {
      title: "Saved report “Feature adoption by cohort”",
      detail: "Filtered to accounts created since September",
      when: "2 days ago",
    },
  ],
  "m-04": [
    {
      title: "Opened issue LUM-244 “CSV export times out”",
      detail: "Exports above 50k rows fail after 30 seconds",
      when: "Yesterday, 08:50",
    },
    {
      title: "Created segment “Power users”",
      detail: "Users with 10+ sessions in the last 14 days",
      when: "5 days ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      title: "Viewed dashboard “Weekly retention”",
      detail: "Read-only access via Viewer role",
      when: "Today, 08:03",
    },
    {
      title: "Viewed report “Feature adoption by cohort”",
      detail: "Read-only access via Viewer role",
      when: "3 days ago",
    },
  ],
  "m-07": [
    {
      title: "Account suspended by Maya Okafor",
      detail: "Access paused while a security review is completed",
      when: "2 weeks ago",
    },
    {
      title: "Merged LUM-198 “Rename events table columns”",
      detail: "Schema migration shipped to production",
      when: "3 weeks ago",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((m) => m.id === id);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "Not joined yet";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

/** Derive a display name from an email local part, e.g. "ana.silva@x.io" -> "Ana Silva". */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return email;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
