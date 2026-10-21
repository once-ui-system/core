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
  extends Omit<React.ComponentProps<typeof ToggleButton>, "label" | "prefixIcon" | "prefix"> {
  /** The text. */
  label: ReactNode;
  /** Leading icon. Omit it for a child item inside a NavGroup, which is indented instead. */
  icon?: IconName;
  /**
   * Any node before the label, such as an `Avatar` for a link to a person or
   * a team. Takes the icon's place in the row; pass `icon` too and the icon
   * comes first. It is decorative: hidden from assistive tech, so the row is
   * named by its label alone ("Ada Lovelace", not "Avatar Ada Lovelace").
   */
  prefix?: ReactNode;
  /**
   * A pill at the end of the row. A number is a count: 0 hides it, anything
   * above 9 prints as 9+ and a screen reader hears "12 unread". Anything else
   * (`"New"`, `"Beta"`) prints as given and is read as its text.
   */
  badge?: number | ReactNode;
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
  ({ label, icon, prefix, badge, indicator, size, className, ...toggle }, ref) => {
    const { variant, density, sizes } = useNavStyle();
    const count = typeof badge === "number" ? badge : undefined;
    // A number shows above 0, as it always did; any other badge shows unless empty.
    const showBadge =
      count !== undefined
        ? count > 0
        : badge !== undefined && badge !== null && badge !== false && badge !== "";
    const trailing = indicator || showBadge;
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
            {prefix !== undefined && prefix !== null && prefix !== false && (
              <Row vertical="center" aria-hidden="true">
                {prefix}
              </Row>
            )}
            {label}
          </Row>
          {showBadge && (
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
              <Text variant="label-default-xs" onSolid="brand-strong">
                {count !== undefined ? (count > 9 ? "9+" : count) : badge}
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
