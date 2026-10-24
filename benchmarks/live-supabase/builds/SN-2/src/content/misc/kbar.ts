import type { KbarItem } from "@once-ui-system/core";
import { orgPath } from "@/lib/orgs/types";

// Command palette entries for the product shell, built for the current
// organization so every destination stays inside its tenant.
const kbar = (org: string): KbarItem[] => [
  { id: "dashboard", name: "Dashboard", icon: "home", shortcut: [], section: "Navigation", keywords: "dashboard home", href: orgPath(org) },
  { id: "members", name: "Members", icon: "people", shortcut: [], section: "Navigation", keywords: "members team invite", href: orgPath(org, "/members") },
  { id: "settings", name: "Settings", icon: "settings", shortcut: [], section: "Navigation", keywords: "settings organization plan", href: orgPath(org, "/settings") },
];

export { kbar };
