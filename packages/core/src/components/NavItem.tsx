"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode } from "react";
import type { IconName } from "../icons";
import { Icon } from "./Icon";
import { useNavStyle } from "./Nav";
import styles from "./Nav.module.scss";
import { Row } from "./Row";
import { Text } from "./Text";
import { ToggleButton } from "./ToggleButton";

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
 * Height, text size and how the current row stands out come from the nearest
 * Nav (`density`, `variant`). Outside one it is a 40px row with `radius="m"`
 * corners and a filled current row. An explicit `size` still wins.
 */
const NavItem = forwardRef<HTMLElement, NavItemProps>(
  ({ label, icon, badge, indicator, size, className, ...toggle }, ref) => {
    const { variant, density, sizes } = useNavStyle();
    const trailing = indicator || (badge !== undefined && badge > 0);
    const selected = Boolean(toggle.selected);
    // `solid` keeps today's look: every row at full contrast, the current one
    // filled. The other two dim the rest and set the current row in strong.
    const emphasis = variant !== "solid";
    return (
      <ToggleButton
        ref={ref}
        fillWidth
        horizontal="start"
        size={size ?? sizes.toggle}
        radius="m"
        aria-current={toggle.href && selected ? "page" : undefined}
        className={classNames(
          variant === "minimal" && styles.quiet,
          !size && density === "spacious" && styles.spacious,
          className,
        )}
        {...toggle}
      >
        <Row
          fillWidth
          gap={sizes.iconGap}
          vertical="center"
          horizontal={trailing ? "between" : "start"}
          textVariant={`label-${emphasis && selected ? "strong" : "default"}-${sizes.text}`}
          onBackground={emphasis ? (selected ? "neutral-strong" : "neutral-weak") : undefined}
        >
          <Row gap={sizes.iconGap} vertical="center">
            {icon && (
              <Icon
                name={icon}
                onBackground={emphasis && selected ? "neutral-strong" : "neutral-weak"}
                size="xs"
              />
            )}
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

export type { NavItemProps };
export { NavItem };
