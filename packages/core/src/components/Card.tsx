"use client";

import React, { forwardRef } from "react";
import { Flex } from ".";
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
  ({ children, href, onClick, selected, style, className, fillHeight, ...flex }, ref) => {
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
          interactive && (`radius-${flex.radius}` || "radius-l"),
        )}
        href={href}
        onClick={onClick && onClick}
        role={onClick ? "button" : href ? "link" : "none"}
        // `aria-selected` only means anything inside a listbox or grid, which
        // a Card knows nothing about. A clickable card that can be on or off
        // is a toggle button, so that is what we announce.
        aria-pressed={onClick && selected !== undefined ? selected : undefined}
        ref={ref}
      >
        <Flex
          background={selected ? "brand-alpha-weak" : "surface"}
          onBackground="neutral-strong"
          transition="macro-medium"
          border={selected ? "brand-medium" : "neutral-medium"}
          cursor="interactive"
          align="left"
          onClick={onClick && onClick}
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
