import type { IconName } from "@once-ui-system/core";

export type NavLink = { href: string; label: string; icon: IconName };

// Sidebar links for one organization. Every href is a page under /app/[org].
export function orgNav(slug: string): NavLink[] {
  return [
    { href: `/app/${slug}`, label: "Dashboard", icon: "home" },
    { href: `/app/${slug}/members`, label: "Members", icon: "people" },
    { href: `/app/${slug}/settings`, label: "Settings", icon: "settings" },
  ];
}
