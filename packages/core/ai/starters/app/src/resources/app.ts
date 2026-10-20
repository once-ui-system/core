import type { IconName } from "@once-ui-system/core";

// Everything the shell shows that is about your product. Edit this file; the
// shell, the breadcrumb and the command palette all read from it.

export const app = {
  name: "Acme",
  // Page titles read "<Page> · Acme"; see `metadata` in src/app/layout.tsx.
  description: "The Acme app",
};

export const user = {
  name: "Jane Doe",
  email: "jane@example.com",
  avatar: "", // an image URL, or "" for initials
};

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavEntry = NavLink | { label: string; icon: IconName; items: NavLink[] };

// Top-level links take an icon; links inside a group take none (the group's rail
// carries the hierarchy). Every href needs a page under src/app/(app)/.
export const nav: NavEntry[] = [
  { href: "/home", label: "Home", icon: "home" },
  {
    label: "Settings",
    icon: "settings",
    items: [{ href: "/settings/profile", label: "Profile" }],
  },
];

/** Every link in `nav`, groups flattened, in order. */
export const navLinks: NavLink[] = nav.flatMap((entry) =>
  "items" in entry ? entry.items : [entry],
);
