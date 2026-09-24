"use client";

import React, { forwardRef, ReactNode } from "react";
import { Icon } from "./Icon";
import { Row } from "./Row";
import { Text } from "./Text";
import { ToggleButton } from "./ToggleButton";
import { IconName } from "../icons";

interface NavItemProps
  extends Omit<React.ComponentProps<typeof ToggleButton>, "label" | "prefixIcon"> {
  /** The text. */
  label: ReactNode;
  /** Leading icon. Omit it for a child item inside a NavGroup, which is indented instead. */
  icon?: IconName;
  /** A count in a pill at the end of the row. Anything above 9 prints as 9+. */
  badge?: number;
  /** A dot at the end of the row, for unread with no number worth showing. */
  indicator?: boolean;
}

/**
 * One row of navigation: a link that knows whether it is the current page.
 *
 * `size="l"` with `radius="m"` is the sidebar shape — a row tall enough to hit
 * and corners smaller than its height. Both are props, so a denser nav can say
 * otherwise.
 */
const NavItem = forwardRef<HTMLElement, NavItemProps>(
  ({ label, icon, badge, indicator, ...toggle }, ref) => {
    const trailing = indicator || (badge !== undefined && badge > 0);
    return (
      <ToggleButton
        ref={ref}
        fillWidth
        horizontal="start"
        size="l"
        radius="m"
        {...toggle}
      >
        <Row
          fillWidth
          gap="12"
          vertical="center"
          horizontal={trailing ? "between" : "start"}
          textVariant="label-default-m"
        >
          <Row gap="12" vertical="center">
            {icon && <Icon name={icon} onBackground="neutral-weak" size="xs" />}
            {label}
          </Row>
          {badge !== undefined && badge > 0 && (
            <Row
              minWidth="16"
              height="16"
              paddingX="4"
              radius="full"
              solid="brand-strong"
              horizontal="center"
              vertical="center"
              aria-label={`${badge} unread`}
            >
              <Text variant="label-default-xs" onSolid="brand-strong">
                {badge > 9 ? "9+" : badge}
              </Text>
            </Row>
          )}
          {indicator && badge === undefined && (
            <Row width="8" height="8" radius="full" solid="brand-strong" aria-hidden="true" />
          )}
        </Row>
      </ToggleButton>
    );
  },
);

NavItem.displayName = "NavItem";

export { NavItem };
export type { NavItemProps };
