"use client";

import classNames from "clsx";
import React, { ReactNode, useEffect } from "react";
import { IconName } from "../icons.js";
import type { LeafProps } from "../interfaces.js";
import { defaultButtonTone } from "../internal/buttonTone.js";
import { Tone, TShirtSizes } from "../types.js";
import { dev } from "../utils/devLogger.js";
import { leafLayout, takeLeafProps } from "../utils/leafLayout.js";
import type { ButtonVariant } from "./Button.js";
import buttonStyles from "./Button.module.scss";
import { dropdownTriggerProps, useDropdownTrigger } from "./DropdownTriggerContext.js";
import { ElementType } from "./ElementType.js";
import { Flex } from "./Flex.js";
import { HoverCard } from "./HoverCard.js";
import { Icon } from "./Icon.js";
import iconStyles from "./IconButton.module.scss";
import { Spinner } from "./Spinner.js";
import { Tooltip } from "./Tooltip.js";

interface IconButtonCommonProps extends LeafProps {
  icon?: IconName;
  id?: string;
  size?: TShirtSizes;
  corners?:
    | "none"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-right"
    | "bottom-left";
  rounded?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  /** How the button looks. The palette it draws in is `tone`. */
  variant?: ButtonVariant;
  /**
   * Which palette the button draws in: the solid fill of a `primary` button,
   * the icon of the others. Defaults to `brand` on `primary` and `neutral` on
   * the rest. 2.x's `variant="danger"` is `tone="danger"`.
   */
  tone?: Tone;
  loading?: boolean;
  disabled?: boolean;
  href?: string;
  children?: ReactNode;
}

export type IconButtonProps = IconButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = IconButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const IconButton = ({
  ref,
  icon = "refresh",
  size = "m",
  id,
  corners,
  rounded = false,
  tooltip,
  tooltipPosition = "top",
  variant = "primary",
  tone,
  loading = false,
  disabled = false,
  href,
  children,
  className,
  style,
  "aria-label": ariaLabel,
  fillWidth,
  ...rest
}: (IconButtonProps | AnchorProps) & { ref?: React.Ref<HTMLButtonElement> }) => {
  const [leaf, props] = takeLeafProps(rest);
  const layout = leafLayout(leaf);
  const radiusSize = size === "s" || size === "m" ? "m" : "l";
  const trigger = useDropdownTrigger();

  // The name is what the caller wrote for people: aria-label, or
  // a tooltip that is plain text. Never the icon key ("chevronRight" is not
  // a name), and never a tooltip node cast to a string ("[object Object]").
  const accessibleName = ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined);
  const namedOtherwise =
    Boolean(children) ||
    Boolean(props["aria-labelledby"]) ||
    props["aria-hidden"] === true ||
    props["aria-hidden"] === "true";

  useEffect(() => {
    if (!accessibleName && !namedOtherwise) {
      dev.warn(
        `IconButton (icon "${icon}") has no accessible name. Give it an aria-label, or a tooltip that is plain text.`,
      );
    }
  }, [accessibleName, namedOtherwise, icon]);

  const button = (
    <ElementType
      id={id}
      href={href}
      ref={ref}
      {...dropdownTriggerProps(trigger, href, props.onClick)}
      disabled={disabled}
      // A loading button is still there but busy, which a screen reader can
      // announce; the spinner alone says nothing.
      aria-busy={loading || undefined}
      data-disabled={disabled ? true : undefined}
      data-border={rounded ? "rounded" : undefined}
      className={classNames(
        buttonStyles.button,
        buttonStyles[variant],
        buttonStyles[`tone-${tone ?? defaultButtonTone(variant)}`],
        iconStyles[size],
        corners === "none"
          ? "radius-none"
          : corners
            ? `radius-${radiusSize}-${corners}`
            : `radius-${radiusSize}`,
        "text-decoration-none",
        "button",
        disabled ? "cursor-not-allowed" : "cursor-interactive",
        fillWidth && "fill-width",
        ...layout.classes,
        className,
      )}
      style={{ ...layout.style, ...style }}
      aria-label={accessibleName}
      aria-disabled={disabled}
      {...props}
    >
      <Flex fill center>
        {loading ? (
          <Spinner size={size === "l" ? "s" : "xs"} />
        ) : children ? (
          children
        ) : (
          <Icon name={icon} size="s" />
        )}
      </Flex>
    </ElementType>
  );

  if (tooltip) {
    return (
      <HoverCard
        trigger={button}
        placement={tooltipPosition}
        fade={0}
        scale={0.9}
        duration={200}
        offsetDistance="4"
      >
        <Tooltip label={tooltip} />
      </HoverCard>
    );
  }

  return button;
};

IconButton.displayName = "IconButton";

export { IconButton };
