import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  description: "A product-analytics and issue-tracking app for small software teams",
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

export const statusTone = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
} as const;

export type NavLink = { href: string; label: string };
export type NavGroupData = { label: string; icon: IconName; items: NavLink[] };

export const nav: NavGroupData[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const navLinks: NavLink[] = nav.flatMap((group) => group.items);

export const reports = [
  { title: "Weekly issue flow", detail: "Opened versus closed issues per project, last 7 days.", cadence: "Weekly" },
  { title: "Release health", detail: "Error rate and regressions after each deploy.", cadence: "Per release" },
  { title: "Funnel conversion", detail: "Sign-up to first project, by acquisition source.", cadence: "Monthly" },
];
