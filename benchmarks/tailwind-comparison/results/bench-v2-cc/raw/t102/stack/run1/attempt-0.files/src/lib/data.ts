import type { IconName } from "@once-ui-system/core";

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const product = "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type NavLeaf = { label: string; href: string; icon: IconName };
export type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

export const nav: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "home" },
      { label: "Reports", href: "/reports", icon: "trend" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { label: "Projects", href: "/projects", icon: "folder" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

/** Dates are fixed to UTC so server and browser render the same text. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
