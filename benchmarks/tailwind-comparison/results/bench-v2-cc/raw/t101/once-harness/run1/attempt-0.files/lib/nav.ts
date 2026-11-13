import type { IconName } from "@once-ui-system/core";

export type NavLink = { href: string; label: string };
export type NavSection = { label: string; icon: IconName; items: NavLink[] };

// Links inside a group take no icon; the group's rail carries the hierarchy.
export const nav: NavSection[] = [
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

export const navLinks: NavLink[] = nav.flatMap((section) => section.items);
