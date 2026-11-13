"use client";

import type React from "react";
import type { ReactNode } from "react";
import type { IconName } from "../icons.js";
import { Card } from "./Card.js";
import { Column } from "./Column.js";
import { Icon } from "./Icon.js";
import { Row } from "./Row.js";
import { Skeleton } from "./Skeleton.js";
import { Text } from "./Text.js";

/** The change since the last period: "+12%", "−3 since Monday". */
interface StatTileDelta {
  label: string;
  /** Which way it went. Draws an arrow; leave it out for none. */
  direction?: "up" | "down";
  /**
   * Whether the change is good news: `success` (green), `danger` (red) or
   * `neutral`. Separate from the direction, since fewer late jobs is good.
   * Defaults to `neutral`.
   */
  tone?: "success" | "danger" | "warning" | "neutral";
}

interface StatTileProps extends Omit<React.ComponentProps<typeof Column>, "children"> {
  /** What is counted: "Open jobs", "Revenue this week". */
  label: ReactNode;
  /** The number, already formatted for the locale ("1,284", "€12.4k", "94%"). */
  value: ReactNode;
  /** An icon beside the label. */
  icon?: IconName;
  /** A line of context under the value: "of 1,500 seats", "updated 2 min ago". */
  hint?: ReactNode;
  /** The change since the last period, beside the value. */
  delta?: StatTileDelta;
  /** A small chart under the value, such as a `Sparkline`. */
  chart?: ReactNode;
  /** Makes the whole tile a link to the screen it sums up. */
  href?: string;
  /** Draws a placeholder for the value while it loads. */
  loading?: boolean;
}

/**
 * One number that matters, with its label and context: the strip of key
 * figures at the top of a dashboard or a console. With `href` the tile is a
 * link to the screen it sums up; without one it is a plain panel, so it does
 * not look clickable. Lay several out in a `Grid` or a wrapping `Row`.
 */
const StatTile = ({
  label,
  value,
  icon,
  hint,
  delta,
  chart,
  href,
  loading = false,
  ...rest
}: StatTileProps) => {
  const deltaTone = delta?.tone ?? "neutral";
  const body = (
    <>
      <Row fillWidth horizontal="between" vertical="center" gap="8">
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>
        {icon && <Icon name={icon} size="xs" onBackground="neutral-weak" />}
      </Row>
      <Column gap="4" fillWidth>
        <Row gap="8" vertical="end" wrap>
          {loading ? (
            <Skeleton shape="line" width={96} height={32} aria-label="Loading" />
          ) : (
            <Text textVariant="display-strong-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
              {value}
            </Text>
          )}
          {delta && !loading && (
            <Row gap="2" vertical="center" paddingBottom="4">
              {delta.direction && (
                <Icon
                  name={delta.direction === "up" ? "arrowUp" : "arrowDown"}
                  size="xs"
                  onBackground={`${deltaTone}-medium`}
                  aria-hidden
                />
              )}
              <Text textVariant="label-strong-s" onBackground={`${deltaTone}-medium`}>
                {delta.label}
              </Text>
            </Row>
          )}
        </Row>
        {hint && (
          <Text textVariant="label-default-xs" onBackground="neutral-weak">
            {hint}
          </Text>
        )}
      </Column>
      {chart}
    </>
  );

  if (href) {
    return (
      <Card
        href={href}
        fillWidth
        direction="column"
        gap="12"
        padding="20"
        radius="l"
        border="neutral-alpha-medium"
        {...(rest as Omit<React.ComponentProps<typeof Card>, "children">)}
      >
        {body}
      </Card>
    );
  }

  return (
    <Column
      fillWidth
      gap="12"
      padding="20"
      radius="l"
      border="neutral-alpha-medium"
      background="surface"
      {...rest}
    >
      {body}
    </Column>
  );
};

StatTile.displayName = "StatTile";

export type { StatTileDelta, StatTileProps };
export { StatTile };
