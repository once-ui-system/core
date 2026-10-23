"use client";

import { useOrg } from "@/components/OrgProvider";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { Column, type Flex, NavItem, selectNavHref } from "@once-ui-system/core";
import { usePathname } from "next/navigation";

interface SidebarProps extends React.ComponentProps<typeof Flex> {
  /** Called after a link is followed, so the mobile drawer can close. */
  onNavigate?: () => void;
}

const entries = [
  { label: "Dashboard", subPath: "", icon: "home" as const },
  { label: "Members", subPath: "/members", icon: "people" as const },
  { label: "Settings", subPath: "/settings", icon: "settings" as const },
];

/** Org-scoped navigation: the slug comes from the URL, so it renders in demo mode too. */
export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, ...flex }) => {
  const pathname = usePathname() ?? "";
  const { slug } = useOrg();
  const org = slug ?? DEMO_ORG_SLUG;
  const current = selectNavHref(
    pathname,
    entries.map((entry) => orgPath(org, entry.subPath)),
  );

  return (
    <Column as="nav" aria-label="Main" data-transition="none" fillWidth paddingX="4" paddingY="20" {...flex}>
      <Column fill overflowY="auto" padding="4" gap="4">
        {entries.map((entry) => {
          const href = orgPath(org, entry.subPath);
          return (
            <NavItem
              key={entry.label}
              href={href}
              icon={entry.icon}
              label={entry.label}
              selected={href === current}
              onClick={onNavigate}
            />
          );
        })}
      </Column>
    </Column>
  );
};
