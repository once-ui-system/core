"use client";

import type { ReactNode } from "react";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

// Internal to NavItem and NavGroup: not exported from the package.

/** Whether a NavItem or NavGroup `badge` shows: a count above 0, or any non-empty node. */
export const showsBadge = (badge: number | ReactNode) =>
  typeof badge === "number"
    ? badge > 0
    : badge !== undefined && badge !== null && badge !== false && badge !== "";

/**
 * The end of a nav row: the badge pill, or the unread dot when there is no
 * badge. Shared by NavItem and NavGroup so a group's "New" lines up with its
 * items' at the row's right edge.
 */
export const NavTrailing = ({
  badge,
  indicator,
}: {
  badge?: number | ReactNode;
  indicator?: boolean;
}) => {
  const count = typeof badge === "number" ? badge : undefined;
  if (showsBadge(badge))
    return (
      <Row
        minWidth="16"
        height="16"
        paddingX="4"
        radius="full"
        solid="brand-strong"
        horizontal="center"
        vertical="center"
        aria-label={count !== undefined ? `${count} unread` : undefined}
      >
        <Text textVariant="label-default-xs" onSolid="brand-strong">
          {count !== undefined ? (count > 9 ? "9+" : count) : badge}
        </Text>
      </Row>
    );
  if (indicator && badge === undefined)
    return (
      <Row width="8" minWidth="8" height="8" radius="full" solid="brand-strong" aria-hidden="true" />
    );
  return null;
};
