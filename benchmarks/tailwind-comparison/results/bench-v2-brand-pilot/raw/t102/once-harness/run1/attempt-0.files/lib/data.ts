import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavLink = { id: string; href: string; label: string; icon: IconName };
export type NavGroupDef = { label: string; icon: IconName; items: NavLink[] };

// "Overview" is the dashboard at "/"; "Reports" shares that screen's route with a
// hash so it resolves to a real page while only three routes exist.
export const navGroups: NavGroupDef[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { id: "overview", href: "/", label: "Overview", icon: "home" },
      { id: "reports", href: "/#reports", label: "Reports", icon: "newspaper" },
    ],
  },
  {
    label: "Workspace",
    icon: "organization",
    items: [
      { id: "projects", href: "/projects", label: "Projects", icon: "folder" },
      { id: "settings", href: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const navLinks: NavLink[] = navGroups.flatMap((group) => group.items);

export const summary = [
  { label: "Open issues", value: "56", note: "across 4 live projects", icon: "flag" },
  { label: "Active projects", value: "3", note: "1 paused, 1 archived", icon: "folder" },
  { label: "Resolved this week", value: "18", note: "6 more than last week", icon: "check" },
  { label: "Team members", value: "7", note: "2 invites waiting", icon: "people" },
] as const satisfies readonly {
  label: string;
  value: string;
  note: string;
  icon: IconName;
}[];

export const recentActivity = [
  { who: "Maya Okafor", what: "closed 3 issues in", where: "Customer app", when: "2 hours ago" },
  { who: "Tomás Reyes", what: "opened a new issue in", where: "Public API", when: "Yesterday" },
  { who: "Priya Nair", what: "shipped a release of", where: "Marketing site", when: "2 days ago" },
];
