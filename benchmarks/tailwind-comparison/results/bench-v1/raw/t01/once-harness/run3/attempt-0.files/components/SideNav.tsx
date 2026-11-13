"use client";

import {
  Column,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  type IconName,
} from "@once-ui-system/core";
import { nav } from "@/lib/data";

type SideNavProps = {
  current: string | null;
  collapsed?: boolean;
};

// Distinct icons per destination in the collapsed rail.
function iconFor(href: string, fallback: IconName): IconName {
  switch (href) {
    case "/":
      return "home";
    case "/reports":
      return "document";
    case "/projects":
      return "folder";
    case "/settings":
      return "settings";
    default:
      return fallback;
  }
}

/**
 * The navigation tree. Expanded: nested groups with labels. Collapsed: every
 * destination stays reachable as an icon button named "Group: Page".
 */
export function SideNav({ current, collapsed = false }: SideNavProps) {
  if (collapsed) {
    return (
      <Nav fill paddingX="8" density="compact" aria-label="Main" horizontal="center">
        <Column gap="4" horizontal="center" fillWidth>
          {nav.map((group, index) => (
            <Column
              key={group.label}
              gap="4"
              horizontal="center"
              role="group"
              aria-label={group.label}
            >
              {index > 0 && <Line width="24" marginY="4" />}
              {group.items.map((link) => {
                const selected = link.href === current;
                return (
                  <IconButton
                    key={link.href}
                    href={link.href}
                    icon={iconFor(link.href, group.icon)}
                    variant={selected ? "secondary" : "tertiary"}
                    tooltip={`${group.label}: ${link.label}`}
                    tooltipPosition="right"
                    aria-label={`${group.label}: ${link.label}`}
                    aria-current={selected ? "page" : undefined}
                  />
                );
              })}
            </Column>
          ))}
        </Column>
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((l) => l.href === current)}
        >
          {group.items.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              selected={link.href === current}
              aria-current={link.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}
