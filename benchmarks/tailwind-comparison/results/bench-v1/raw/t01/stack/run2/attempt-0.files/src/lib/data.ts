import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

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

export type NavLeaf = { label: string; href: string };
export type NavNode = {
  key: string;
  label: string;
  icon: IconName;
  items: NavLeaf[];
};

/**
 * Navigation groups. "Overview" is the dashboard at `/`; "Reports" has no
 * page of its own yet, so it points at the dashboard's reports anchor.
 */
export const navGroups: NavNode[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      { label: "Reports", href: "/#reports" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/projects": "Projects",
  "/settings": "Settings",
};

export const routeGroups: Record<string, string> = {
  "/": "Analytics",
  "/projects": "Workspace",
  "/settings": "Workspace",
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}, ${y}`;
}

export const summary = {
  openIssues: projects.reduce((sum, p) => sum + p.issues, 0),
  activeProjects: projects.filter((p) => p.status === "Active").length,
  totalProjects: projects.length,
};

export const recentActivity = [
  { who: "Maya Okafor", what: "closed 3 issues in Customer app", when: "Today" },
  { who: "Tomás Reyes", what: "opened WEB-48 “Hero image is blurry on retina”", when: "Yesterday" },
  { who: "Priya Nair", what: "shipped Public API v1.4 release notes", when: "Oct 9" },
];
