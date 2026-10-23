import type { KbarItem } from "@once-ui-system/core";
import { orgPath } from "@/lib/orgs/types";

// Command palette entries for the product shell. Owned by the dashboard
// surface: a project scaffolded without it has no command palette to feed.
//
// A function of the organization rather than a constant, because every
// destination below lives under `/app/<slug>` and the palette has to send
// you to the tenant you are actually in.
const kbar = (org: string): KbarItem[] => [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "home",
    shortcut: [],
    section: "Navigation",
    keywords: "dashboard home",
    href: orgPath(org),
  },
  {
    id: "members",
    name: "Members",
    icon: "people",
    shortcut: [],
    section: "Navigation",
    keywords: "members metrics",
    href: orgPath(org, "/members"),
  },
  {
    id: "settings",
    name: "Settings",
    icon: "settings",
    shortcut: [],
    section: "Navigation",
    keywords: "settings organization plan billing",
    href: orgPath(org, "/settings"),
  },
]

export { kbar }
