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
  when: string;
};

export const ROLES: Role[] = ["Owner", "Admin", "Member", "Viewer"];

export const PRODUCT = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
  workspace: "Acme Labs",
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

const activityByMember: Record<string, Activity[]> = {
  "m-01": [
    {
      id: "a-01-1",
      summary: "Updated billing plan",
      detail: "Switched the workspace to the Team plan (10 seats).",
      when: "2 days ago",
    },
    {
      id: "a-01-2",
      summary: "Changed a role",
      detail: "Promoted Daniel Reyes to Admin.",
      when: "3 weeks ago",
    },
    {
      id: "a-01-3",
      summary: "Created dashboard",
      detail: "Built the “Weekly retention” dashboard.",
      when: "1 month ago",
    },
  ],
  "m-02": [
    {
      id: "a-02-1",
      summary: "Closed issue LUM-214",
      detail: "Fixed the funnel chart dropping events after midnight UTC.",
      when: "Today, 09:42",
    },
    {
      id: "a-02-2",
      summary: "Invited Hana Sato",
      detail: "Sent a Member invite to hana@acmelabs.io.",
      when: "Yesterday",
    },
    {
      id: "a-02-3",
      summary: "Edited saved view",
      detail: "Renamed “Checkout drop-off” to “Checkout drop-off (mobile)”.",
      when: "4 days ago",
    },
    {
      id: "a-02-4",
      summary: "Connected an integration",
      detail: "Linked the GitHub repository acmelabs/web-app.",
      when: "2 weeks ago",
    },
  ],
  "m-03": [
    {
      id: "a-03-1",
      summary: "Commented on LUM-231",
      detail: "Shared a session replay showing the onboarding stall.",
      when: "Yesterday",
    },
    {
      id: "a-03-2",
      summary: "Opened issue LUM-236",
      detail: "Reported a duplicate event in the signup funnel.",
      when: "5 days ago",
    },
  ],
  "m-04": [
    {
      id: "a-04-1",
      summary: "Resolved issue LUM-228",
      detail: "Patched the CSV export timeout for large projects.",
      when: "3 days ago",
    },
    {
      id: "a-04-2",
      summary: "Created saved view",
      detail: "Added “Errors by release” to the shared views.",
      when: "1 week ago",
    },
  ],
  "m-05": [],
  "m-06": [
    {
      id: "a-06-1",
      summary: "Viewed dashboard",
      detail: "Opened “Weekly retention”.",
      when: "Today, 08:15",
    },
    {
      id: "a-06-2",
      summary: "Exported report",
      detail: "Downloaded the March activation report as PDF.",
      when: "1 week ago",
    },
  ],
  "m-07": [
    {
      id: "a-07-1",
      summary: "Account suspended",
      detail: "Access paused by an admin pending a security review.",
      when: "6 weeks ago",
    },
    {
      id: "a-07-2",
      summary: "Commented on LUM-190",
      detail: "Asked for more detail on the alerting rules.",
      when: "7 weeks ago",
    },
  ],
  "m-08": [],
};

export function getMember(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}

export function getActivity(id: string): Activity[] {
  return activityByMember[id] ?? [];
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
