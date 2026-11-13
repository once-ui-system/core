export const product = {
  name: "Lumen",
  tagline:
    "Product analytics and issue tracking for small software teams",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export const user: User = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const projects: Project[] = [
  {
    key: "WEB",
    name: "Marketing site",
    status: "Active",
    issues: 12,
    updated: "2026-10-12",
  },
  {
    key: "APP",
    name: "Customer app",
    status: "Active",
    issues: 31,
    updated: "2026-10-14",
  },
  {
    key: "API",
    name: "Public API",
    status: "Active",
    issues: 9,
    updated: "2026-10-09",
  },
  {
    key: "MOB",
    name: "Mobile beta",
    status: "Paused",
    issues: 4,
    updated: "2026-09-28",
  },
  {
    key: "OPS",
    name: "Internal tools",
    status: "Archived",
    issues: 0,
    updated: "2026-08-30",
  },
];

export const statusColor: Record<ProjectStatus, string> = {
  Active: "teal",
  Paused: "yellow",
  Archived: "gray",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}
