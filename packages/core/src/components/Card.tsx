"use client";

import React, { forwardRef } from "react";
import { Flex } from "./Flex";
import styles from "./Card.module.scss";
import { ElementType } from "./ElementType";
import classNames from "clsx";

interface CardProps extends React.ComponentProps<typeof Flex> {
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  fillHeight?: boolean;
  /**
   * Marks the card as the chosen one in a set — a plan picker, a template
   * gallery, a multi-select list. Repaints the border and background in the
   * brand scheme, and, for a card that is actually operable, exposes the
   * state to assistive tech as a toggle. Both colours are only defaults:
   * pass `background` or `border` explicitly to override either.
   */
  selected?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      href,
      onClick,
      selected,
      style,
      className,
      fillHeight,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...flex
    },
    ref,
  ) => {
    const interactive = Boolean(onClick || href);
    return (
      <ElementType
        tabIndex={interactive ? 0 : undefined}
        className={classNames(
          "reset-button-styles",
          "display-flex",
          "fill-width",
          fillHeight ? "fill-height" : undefined,
          "min-width-0",
          interactive && "focus-ring",
          // `\`radius-${flex.radius}\` || "radius-l"` never reached the
          // fallback: a template literal is a string, so it is truthy even
          // when the value inside it is `undefined`, and an interactive card
          // with no explicit radius got the class `radius-undefined`.
          interactive && `radius-${flex.radius ?? "l"}`,
        )}
        href={href}
        // A link card runs its handler through `onLinkClick`, since
        // ElementType does not pass `onClick` to an anchor. The surface
        // below must not carry it too: a click on the content would bubble
        // to this element and run it twice, which undoes a toggle.
        onClick={onClick}
        onLinkClick={href ? onClick : undefined}
        role={onClick ? "button" : href ? "link" : "none"}
        // `aria-selected` only means anything inside a listbox or grid, which
        // a Card knows nothing about. A clickable card that can be on or off
        // is a toggle button, so that is what we announce.
        aria-pressed={onClick && selected !== undefined ? selected : undefined}
        // The name belongs to the element that takes focus. Left in `flex`
        // it landed on the inner surface, and the link or button was named
        // by whatever text the card happened to contain.
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        ref={ref}
      >
        <Flex
          background={selected ? "brand-alpha-weak" : "surface"}
          onBackground="neutral-strong"
          transition="macro-medium"
          border={selected ? "brand-medium" : "neutral-medium"}
          // A card with nothing to click should not promise a click.
          cursor={interactive ? "interactive" : undefined}
          align="left"
          className={classNames(styles.card, selected && styles.selected, className)}
          style={{...style}}
          {...flex}
        >
          {children}
        </Flex>
      </ElementType>
    );
  },
);

Card.displayName = "Card";
export { Card };
