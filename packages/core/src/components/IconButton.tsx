"use client";

import classNames from "clsx";
import React, { forwardRef, ReactNode, useEffect } from "react";
import { IconName } from "../icons";
import { ColorScheme, ColorWeight, TShirtSizes } from "../types";
import { dev } from "../utils/devLogger";
import buttonStyles from "./Button.module.scss";
import { dropdownTriggerProps, useDropdownTrigger } from "./DropdownTriggerContext";
import { ElementType } from "./ElementType";
import { Flex } from "./Flex";
import { HoverCard } from "./HoverCard";
import { Icon } from "./Icon";
import iconStyles from "./IconButton.module.scss";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";

interface IconButtonCommonProps {
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
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "subtle"
    | "danger"
    | "success"
    | "warning"
    | "ghost"
    | "link";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  children?: ReactNode;
  color?: `${ColorScheme}-${ColorWeight}`;
  /** The button's accessible name, like the `ariaLabel` the other components
   *  take. Native `aria-label` wins when both are given. */
  ariaLabel?: string;
}

export type IconButtonProps = IconButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = IconButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps | AnchorProps>(
  (
    {
      icon = "refresh",
      size = "m",
      id,
      corners,
      rounded = false,
      tooltip,
      tooltipPosition = "top",
      variant = "primary",
      loading = false,
      disabled = false,
      href,
      children,
      color,
      className,
      style,
      ariaLabel,
      "aria-label": nativeAriaLabel,
      ...props
    },
    ref,
  ) => {
    const radiusSize = size === "s" || size === "m" ? "m" : "l";
    const trigger = useDropdownTrigger();

    // The name is what the caller wrote for people: aria-label, ariaLabel, or
    // a tooltip that is plain text. Never the icon key ("chevronRight" is not
    // a name), and never a tooltip node cast to a string ("[object Object]").
    const accessibleName =
      nativeAriaLabel ?? ariaLabel ?? (typeof tooltip === "string" ? tooltip : undefined);
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
          iconStyles[size],
          corners === "none"
            ? "radius-none"
            : corners
              ? `radius-${radiusSize}-${corners}`
              : `radius-${radiusSize}`,
          "text-decoration-none",
          "button",
          disabled ? "cursor-not-allowed" : "cursor-interactive",
          className,
        )}
        style={style}
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
            <Icon name={icon} size="s" onBackground={color} />
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
  },
);

IconButton.displayName = "IconButton";

export { IconButton };
