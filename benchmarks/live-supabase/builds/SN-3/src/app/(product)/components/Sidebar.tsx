"use client";

import type { IconName } from "@once-ui-system/core";
import { Column, type Flex, NavItem, selectNavHref } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";

interface SidebarProps extends React.ComponentProps<typeof Flex> {}

/**
 * The product navigation as data. `subPath` is relative to the current
 * organization — every entry here is org-scoped, so the slug is applied in
 * one place below rather than written into each link.
 *
 * The resolved href is what the current-page match runs on: `selectNavHref`
 * picks the longest href that prefixes the path, so a nested route lights
 * its section up and a sibling never does. Entries without a `subPath` are
 * placeholders for routes the app has not built yet — the template shows
 * the shape, not a finished product.
 */
type Entry = { label: string; subPath?: string; icon?: IconName; indicator?: boolean };

const entries: Entry[] = [
  { label: "Dashboard", subPath: "", icon: "home" },
  { label: "Members", subPath: "/members", icon: "people" },
  { label: "Settings", subPath: "/settings", icon: "settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ ...flex }) => {
  const pathname = usePathname() ?? "";
  // The URL segment, not the loaded organization: the nav has to render on
  // the first paint and in demo mode, both of which happen before — or
  // entirely without — the org list arriving.
  const { slug } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;

  const hrefOf = (entry: Entry) =>
    entry.subPath === undefined ? undefined : orgPath(org, entry.subPath);
  const current = selectNavHref(
    pathname,
    entries.flatMap((entry) => {
      const href = hrefOf(entry);
      return href ? [href] : [];
    }),
  );

  const item = (entry: Entry, withIcon: boolean) => {
    const href = hrefOf(entry);
    return (
      <NavItem
        key={entry.label}
        href={href}
        icon={withIcon ? entry.icon : undefined}
        label={entry.label}
        indicator={entry.indicator}
        selected={href !== undefined && href === current}
      />
    );
  };

  return (
    <Column data-transition="none" fillWidth paddingX="4" paddingY="20" {...flex}>
      <Column fill overflowY="auto" padding="4" gap="4">
        {entries.map((entry) => item(entry, true))}
      </Column>
    </Column>
  );
};

export { Sidebar };
