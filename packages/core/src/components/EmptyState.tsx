"use client";

import classNames from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import type { IconName } from "../icons.js";
import { Column } from "./Column.js";
import styles from "./EmptyState.module.scss";
import { Heading } from "./Heading.js";
import { Icon } from "./Icon.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

type EmptyStateSize = "s" | "m" | "l";

export interface EmptyStateProps
  extends Omit<React.ComponentProps<typeof Column>, "title" | "children"> {
  /**
   * What sits above the title: a `Mascot`, a Cube Emote, an illustration.
   * Wins over `icon`.
   */
  visual?: ReactNode;
  /** A plain icon above the title, when there is no `visual`. */
  icon?: IconName;
  /** What is empty, said plainly: "No clients yet". */
  title: ReactNode;
  /** One sentence on what fills it, or what to do next. */
  description?: ReactNode;
  /** The one next step, usually the page's primary button. */
  action?: ReactNode;
  /** A second, quieter step: a link to the docs, an import. */
  secondaryAction?: ReactNode;
  /**
   * `s` inside a table, list, select or chart; `m` in a card or panel; `l`
   * for a whole page that has nothing in it yet. Defaults to `m`.
   */
  size?: EmptyStateSize;
  /** The title's element. Defaults to `h2`. */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const SIZES = {
  // `s` keeps the look Table's empty states had before they used this.
  s: { paddingY: "xl", gap: "m", icon: "l", title: "heading-strong-s", body: "body-default-s" },
  m: { paddingY: "48", gap: "16", icon: "l", title: "heading-strong-m", body: "body-default-m" },
  l: { paddingY: "80", gap: "20", icon: "xl", title: "heading-strong-l", body: "body-default-m" },
} as const;

/**
 * What a page, panel or list shows before it has anything in it: a visual, a
 * title, a line on what to do, and the action that does it. Pass a `Mascot`
 * (flat surface reads best) or a Cube Emote as `visual`, or just an `icon`.
 */
const EmptyState = ({
  visual,
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "m",
  titleAs = "h2",
  className,
  ...rest
}: EmptyStateProps) => {
  const s = SIZES[size];
  const art =
    visual ?? (icon ? <Icon name={icon} size={s.icon} onBackground="neutral-weak" /> : null);
  return (
    <Column
      fillWidth
      horizontal="center"
      gap={s.gap}
      paddingY={s.paddingY}
      paddingX={size === "s" ? "xl" : "24"}
      className={classNames(styles.emptyState, className)}
      data-size={size}
      {...rest}
    >
      {art && (
        <Row horizontal="center" aria-hidden="true">
          {art}
        </Row>
      )}
      <Column horizontal="center" gap={size === "s" ? "4" : "8"} className={styles.text}>
        <Heading as={titleAs} textVariant={s.title} align="center">
          {title}
        </Heading>
        {description && (
          <Text textVariant={s.body} onBackground="neutral-weak" align="center" wrap="balance">
            {description}
          </Text>
        )}
      </Column>
      {(action || secondaryAction) && (
        <Row gap="8" horizontal="center" wrap paddingTop={size === "s" ? undefined : "4"}>
          {action}
          {secondaryAction}
        </Row>
      )}
    </Column>
  );
};

EmptyState.displayName = "EmptyState";

export { EmptyState };
