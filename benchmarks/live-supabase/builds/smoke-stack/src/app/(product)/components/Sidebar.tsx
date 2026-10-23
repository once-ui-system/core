"use client";

import type { IconName } from "@once-ui-system/core";
import { Column, type Flex, Icon, Line, NavGroup, NavItem, Row, Text, selectNavHref } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

const home: Entry[] = [
  { label: "Dashboard", subPath: "", icon: "home" },
  { label: "Analytics", subPath: "/analytics", icon: "trend" },
  { label: "Reports", icon: "pages", indicator: true },
];

const manage: Entry[] = [
  { label: "Users", subPath: "/users" },
  { label: "Billing", subPath: "/billing" },
  { label: "Roles" },
  { label: "Permissions" },
];

const projects: Entry[] = [{ label: "Overview" }, { label: "My projects" }];

/**
 * The top links are where people spend the day; everything behind them sits
 * in groups that fold away, so the sidebar stays short as the app grows.
 */
const groups: { key: string; label: string; icon: IconName; entries: Entry[] }[] = [
  { key: "manage", label: "Manage", icon: "people", entries: manage },
  { key: "projects", label: "Projects", icon: "folder", entries: projects },
];

const Sidebar: React.FC<SidebarProps> = ({ ...flex }) => {
  const pathname = usePathname() ?? "";
  // The URL segment, not the loaded organization: the nav has to render on
  // the first paint and in demo mode, both of which happen before — or
  // entirely without — the org list arriving.
  const { slug } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;

  const entries = [...home, ...manage, ...projects];
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

  // The group holding the current page opens itself; the rest keep whatever
  // the person left them at.
  const routeGroup = groups.find((group) =>
    group.entries.some((entry) => {
      const href = hrefOf(entry);
      return href !== undefined && href === current;
    }),
  )?.key;
  const [open, setOpen] = useState<Record<string, boolean>>(
    routeGroup ? { [routeGroup]: true } : {},
  );
  useEffect(() => {
    if (routeGroup) setOpen((state) => ({ ...state, [routeGroup]: true }));
  }, [routeGroup]);

  return (
    <Column data-transition="none" fillWidth paddingX="4" paddingY="20" {...flex}>
      <Column fill overflowY="auto" padding="4" gap="4">
        {home.map((entry) => item(entry, true))}

        <Line background="neutral-alpha-medium" marginY="12" />
        <Text variant="label-default-xs" onBackground="neutral-weak" paddingX="16" paddingBottom="4">
          Workspace
        </Text>

        {groups.map((group) => (
          <NavGroup
            key={group.key}
            label={
              // Core 2.1's group header sits 9px left of a NavItem's icon; this
              // lines the two columns up. Core's next Nav release insets the
              // header itself, and then the plain label/icon props are enough.
              <Row gap="12" vertical="center" paddingLeft={0.5625}>
                <Icon name={group.icon} onBackground="neutral-weak" size="xs" />
                {group.label}
              </Row>
            }
            open={!!open[group.key]}
            onToggle={() => setOpen((state) => ({ ...state, [group.key]: !state[group.key] }))}
          >
            {group.entries.map((entry) => item(entry, false))}
          </NavGroup>
        ))}
      </Column>
    </Column>
  );
};

export { Sidebar };
