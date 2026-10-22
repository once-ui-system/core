"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef } from "react";
import { ElementType } from "../../components/ElementType";
import styles from "./MapPin.module.scss";
import type { MapColor } from "./types";

export interface MapPinProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "prefix" | "onClick"> {
  /** The pin's text: a price, a count, a short name. Omit for a dot. */
  children?: React.ReactNode;
  /** Something before the label, such as an Icon or Avatar. */
  prefix?: React.ReactNode;
  /** "pill" carries a label; "dot" marks a point. Default "pill" with children, else "dot". */
  variant?: "pill" | "dot";
  /** The hovered or selected pin: solid in `color`. */
  active?: boolean;
  /** The colour family when active (and always, for a dot). Default "brand". */
  color?: MapColor;
  /** A pin that opens a page. Without `href` or `onClick` it is not focusable. */
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * The marker Once UI draws: a label pill (prices on a listing map) or a dot.
 * It is a link with `href`, a button with `onClick`, otherwise a plain mark.
 */
const MapPin = forwardRef<HTMLElement, MapPinProps>(
  (
    {
      children,
      prefix,
      variant,
      active = false,
      color = "brand",
      href,
      onClick,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const kind = variant ?? (children || prefix ? "pill" : "dot");
    const classes = classNames(
      styles.pin,
      styles[kind],
      active && styles.active,
      (href || onClick) && styles.interactive,
      className,
    );
    const colorStyle = {
      "--map-pin-solid": `var(--${color}-solid-strong)`,
      "--map-pin-on-solid": `var(--${color}-on-solid-strong)`,
      ...style,
    } as React.CSSProperties;
    const content = (
      <>
        {prefix}
        {kind === "pill" && children}
      </>
    );

    if (href || onClick) {
      return (
        <ElementType
          ref={ref}
          href={href}
          onClick={onClick}
          className={classes}
          style={colorStyle}
          aria-pressed={!href && onClick ? active : undefined}
          {...rest}
        >
          {content}
        </ElementType>
      );
    }
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={classes}
        style={colorStyle}
        {...rest}
      >
        {content}
      </span>
    );
  },
);

MapPin.displayName = "MapPin";

export { MapPin };
