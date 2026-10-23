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
    id: "analytics",
    name: "Analytics",
    icon: "trend",
    shortcut: [],
    section: "Navigation",
    keywords: "analytics metrics",
    href: orgPath(org, "/analytics"),
  },
]

export { kbar }
