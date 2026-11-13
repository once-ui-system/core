import type { IconName } from "@once-ui-system/core";

export type NavLink = { href: string; label: string };
export type NavGroupEntry = { key: string; label: string; icon: IconName; items: NavLink[] };

// Analytics: Overview (the dashboard) and Reports. Workspace: Projects and Settings.
// Every href is a real route.
export const navGroups: NavGroupEntry[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "folder",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export const navLinks: (NavLink & { group: string })[] = navGroups.flatMap((g) =>
  g.items.map((item) => ({ ...item, group: g.label })),
);
