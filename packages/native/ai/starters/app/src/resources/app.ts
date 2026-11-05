import type { IconName } from "@once-ui-system/native";

// Everything the shell shows that is about your product. Edit this file; the tab
// bar, the screen headers and the settings list all read from it. It has the same
// shape as the web starter's src/resources/app.ts, and the same routes.

export const app = {
  name: "Acme",
  description: "The Acme app",
};

export const user = {
  name: "Jane Doe",
  email: "jane@example.com",
  avatar: "", // an image URL, or "" for initials
};

export type NavLink = { href: string; label: string; icon?: IconName };
export type NavEntry = NavLink | { label: string; icon: IconName; items: NavLink[] };

// Each top-level entry is a tab. A group is a tab too: its screen lists the
// group's links. Every href needs a screen under app/(app)/, and a group's links
// share its folder (/settings/profile lives in app/(app)/settings/).
export const nav: NavEntry[] = [
  { href: "/home", label: "Home", icon: "home" },
  {
    label: "Settings",
    icon: "settings",
    items: [{ href: "/settings/profile", label: "Profile" }],
  },
];

/** The route a tab opens: its own href, or a group's folder. */
export const tabHref = (entry: NavEntry) =>
  "items" in entry ? `/${entry.items[0].href.split("/")[1]}` : entry.href;

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
