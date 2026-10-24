"use client";

import type { IconName } from "@once-ui-system/core";
import { Column, type Flex, NavItem, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";

interface SidebarProps extends React.ComponentProps<typeof Flex> {
  /** Called after a link is followed, so the mobile drawer can close. */
  onNavigate?: () => void;
}

/** The organization's pages. `subPath` is relative to the organization. */
const entries: { label: string; subPath: string; icon: IconName }[] = [
  { label: "Dashboard", subPath: "", icon: "home" },
  { label: "Members", subPath: "/members", icon: "people" },
  { label: "Settings", subPath: "/settings", icon: "settings" },
];

/** The signed-in navigation for the current organization. */
export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, ...flex }) => {
  const pathname = usePathname() ?? "";
  // The URL segment decides the tenant, so it is available on the first paint
  // and in demo mode, before or without the organization list.
  const { slug } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;

  // The longest matching entry is the current page, so /app/acme/members only
  // highlights Members and never Dashboard.
  const hrefs = entries.map((entry) => orgPath(org, entry.subPath));
  const current = hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <Column data-transition="none" fillWidth paddingX="4" paddingY="20" gap="4" {...flex}>
      {entries.map((entry, index) => (
        <NavItem
          key={entry.label}
          href={hrefs[index]}
          icon={entry.icon}
          label={entry.label}
          selected={hrefs[index] === current}
          onClick={onNavigate}
        />
      ))}
      <Text variant="body-default-xs" onBackground="neutral-weak" paddingX="16" paddingTop="16">
        Acme Notes
      </Text>
    </Column>
  );
};
