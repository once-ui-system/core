"use client";

import classNames from "clsx";
import type React from "react";
import { ElementType } from "../../components/ElementType.js";
import { Icon } from "../../components/Icon.js";
import type { IconName } from "../../icons.js";
import styles from "./MapPin.module.scss";
import type { MapTone } from "./types.js";

export interface MapPinProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "prefix" | "onClick"> {
  ref?: React.Ref<HTMLElement>;
  /** The pin's text: a price, a count, a short name. Omit for a dot. */
  children?: React.ReactNode;
  /** Something before the label, such as an Avatar. For a type icon, use `icon`. */
  prefix?: React.ReactNode;
  /**
   * What the place is (an ambulance, a hydrant, a café), on a disc in `tone`
   * that shows at rest, so type and status read without opening the pin.
   * Alone it is a round marker; with children it leads the pill.
   */
  icon?: IconName;
  /**
   * "pill" carries a label; "icon" is a round marker for `icon`; "dot" marks
   * a point. Default "pill" with children, "icon" with only an icon, else "dot".
   */
  variant?: "pill" | "icon" | "dot";
  /** The hovered or selected pin: solid in `tone`. */
  active?: boolean;
  /**
   * The status colour. A dot and an icon disc wear it always; a pill shows it
   * as a leading mark at rest when `tone` is set, and fills with it when
   * active. Default "brand".
   */
  tone?: MapTone;
  /** A pin that opens a page. Without `href` or `onClick` it is not focusable. */
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

/**
 * The marker Once UI draws: a label pill (prices on a listing map) or a dot.
 * It is a link with `href`, a button with `onClick`, otherwise a plain mark.
 */
const MapPin = ({
  ref,
  children,
  prefix,
  icon,
  variant,
  active = false,
  tone: toneProp,
  href,
  onClick,
  className,
  style,
  ...rest
}: MapPinProps) => {
  const tone = toneProp ?? "brand";
  const kind = variant ?? (children || prefix ? "pill" : icon ? "icon" : "dot");
  const classes = classNames(
    styles.pin,
    styles[kind],
    active && styles.active,
    // A set tone rings the whole pill, so status reads at a glance.
    kind === "pill" && (toneProp || icon) && styles.toned,
    (href || onClick) && styles.interactive,
    className,
  );
  const colorStyle = {
    "--map-pin-solid": `var(--${tone}-solid-strong)`,
    "--map-pin-on-solid": `var(--${tone}-on-solid-strong)`,
    ...style,
  } as React.CSSProperties;
  const content = (
    <>
      {prefix}
      {icon && kind !== "dot" ? (
        <span className={styles.disc} aria-hidden="true">
          <Icon name={icon} decorative />
        </span>
      ) : (
        kind === "pill" && toneProp && <span className={styles.status} aria-hidden="true" />
      )}
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
    <span ref={ref as React.Ref<HTMLSpanElement>} className={classes} style={colorStyle} {...rest}>
      {content}
    </span>
  );
};

MapPin.displayName = "MapPin";

export { MapPin };
