"use client";

import classNames from "clsx";
import React, { type ReactNode, useId } from "react";
import type { IconName } from "../icons.js";
import type { Placement } from "../types.js";
import { Column } from "./Column.js";
import { HoverCard } from "./HoverCard.js";
import { Icon } from "./Icon.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";
import styles from "./Tooltip.module.scss";

interface TooltipProps extends Omit<React.ComponentProps<typeof Row>, "content"> {
  /**
   * The bubble's text, for a bubble you position yourself (Button, IconButton
   * and Icon render one for their `tooltip` prop). For a tooltip that opens
   * on hover and focus of a trigger, use `content`.
   */
  label?: ReactNode;
  /**
   * The explanation, a sentence or two, revealed on hover or focus of the
   * children. With no children the trigger is a focusable info icon: the
   * "what is this?" affordance that was `InfoTip` in 2.x. The explanation is
   * announced as the trigger's description.
   */
  content?: ReactNode;
  /** The trigger `content` describes. Omit it for the info icon. */
  children?: ReactNode;
  /** With `content` and no children: the info icon's size, matched to the text beside it. */
  size?: React.ComponentProps<typeof Icon>["size"];
  /** With `content`: where the tooltip opens. */
  placement?: Placement;
  /** With `content`: milliseconds of hover before it opens. */
  delay?: number;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  className?: string;
  style?: React.CSSProperties;
}

/** The explanation's panel, with the info trigger it opens from: 2.x InfoTip. */
const ContentTooltip = ({
  content,
  children,
  size = "xs",
  placement,
  delay,
  "aria-label": ariaLabel = "More information",
  ...flex
}: Omit<TooltipProps, "label" | "prefixIcon" | "suffixIcon">) => {
  const tipId = useId();

  // A tab stop with a name, so the tip is reachable without a pointer:
  // HoverCard opens on focus as well as hover, and while it is open the tip
  // describes the trigger.
  const trigger =
    children === undefined || children === null ? (
      <Icon
        name="info"
        size={size}
        onBackground="neutral-weak"
        decorative={false}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-describedby={tipId}
        radius="full"
        className="focus-ring"
      />
    ) : React.isValidElement<{ "aria-describedby"?: string }>(children) ? (
      React.cloneElement(children, {
        "aria-describedby": classNames(children.props["aria-describedby"], tipId),
      })
    ) : (
      children
    );

  return (
    <HoverCard trigger={trigger} placement={placement} delay={delay}>
      <Column
        id={tipId}
        role="tooltip"
        maxWidth="18rem"
        paddingY="8"
        paddingX="12"
        background="page"
        radius="m"
        border
        {...flex}
      >
        <Text textVariant="label-default-s" onBackground="neutral-medium">
          {content}
        </Text>
      </Column>
    </HoverCard>
  );
};

/**
 * A short, non-interactive explanation.
 *
 * - `<Tooltip content="…">{trigger}</Tooltip>` opens on hover and focus of the
 *   trigger and describes it.
 * - `<Tooltip content="…" />` renders a focusable info icon as the trigger
 *   (2.x `InfoTip`).
 * - `<Tooltip label="…" />` is the bare bubble, for a caller that positions it.
 */
const Tooltip = ({
  ref,
  label,
  content,
  prefixIcon,
  suffixIcon,
  className,
  style,
  ...flex
}: TooltipProps) => {
  if (content !== undefined) {
    return <ContentTooltip content={content} className={className} style={style} {...flex} />;
  }

  const {
    children: _children,
    size: _size,
    placement: _placement,
    delay: _delay,
    ...bubble
  } = flex;
  return (
    <Row
      m={{ hide: true }}
      ref={ref}
      style={{
        whiteSpace: "nowrap",
        userSelect: "none",
        ...style,
      }}
      vertical="center"
      gap="4"
      zIndex={1}
      background="surface"
      paddingY="4"
      paddingX="8"
      radius="s"
      border="neutral-medium"
      role="tooltip"
      className={classNames(styles.tooltip, styles.fadeIn, className)}
      {...bubble}
    >
      {prefixIcon && <Icon name={prefixIcon} size="xs" />}
      <Row
        className={styles.label}
        paddingX="2"
        vertical="center"
        textVariant="body-default-xs"
        onBackground="neutral-strong"
      >
        {label}
      </Row>
      {suffixIcon && <Icon name={suffixIcon} size="xs" />}
    </Row>
  );
};

Tooltip.displayName = "Tooltip";

export type { TooltipProps };
export { Tooltip };
