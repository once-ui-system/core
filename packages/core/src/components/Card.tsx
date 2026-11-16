"use client";

import classNames from "clsx";
import type React from "react";
import type { Schemes, Tone } from "../types.js";
import styles from "./Card.module.scss";
import { ElementType } from "./ElementType.js";
import { Flex } from "./Flex.js";

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
  /**
   * The colour the card picks up on hover and keyboard focus: a faint fill
   * and edge in that palette, instead of the neutral grey. A tone (`brand`,
   * `accent`, `success`…) or a named hue (`cyan`, `magenta`…), so a card can
   * light up in the colour of the product it stands for. The tint stays on
   * while the card is `selected`. Only the card's own surface is tinted:
   * buttons and text inside keep their colours.
   */
  tint?: Exclude<Tone, "neutral"> | Schemes;
  style?: React.CSSProperties;
  className?: string;
}

const TONES = new Set<string>(["brand", "accent", "info", "success", "warning", "danger"]);

const Card = ({
  ref,
  children,
  href,
  onClick,
  selected,
  tint,
  style,
  className,
  fillHeight,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  ...flex
}: CardProps) => {
  const interactive = Boolean(onClick || href);
  // A width on the card belongs to the whole card: the outer element hugs the
  // surface instead of stretching, so the click area matches what you see.
  // maxWidth alone is not one: such a card still fills its row up to the cap.
  const sized = flex.width !== undefined || flex.fitWidth === true || flex.fit === true;
  return (
    <ElementType
      tabIndex={interactive ? 0 : undefined}
      className={classNames(
        "reset-button-styles",
        "display-flex",
        sized ? "fit-width" : "fill-width",
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
      // A clickable card is an action, never a form submit: a Card with
      // onClick inside a form must not send it.
      type={onClick && !href ? "button" : undefined}
      // ElementType runs `onClick` on a link as well as on a button. The
      // surface below must not carry it too: a click on the content would
      // bubble to this element and run it twice, which undoes a toggle.
      onClick={onClick}
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
        // A tinted card shows `selected` through its tint layer instead.
        background={selected && !tint ? "brand-alpha-weak" : "surface"}
        onBackground="neutral-strong"
        transition="macro-medium"
        border={selected && !tint ? "brand-medium" : "neutral-medium"}
        // A card with nothing to click should not promise a click.
        cursor={interactive ? "interactive" : undefined}
        align="left"
        className={classNames(
          styles.card,
          selected && styles.selected,
          tint && styles.tinted,
          className,
        )}
        style={{ ...style }}
        {...flex}
      >
        {tint && (
          // The tint is a layer under the content. A named hue rides on its
          // own data-brand, so the brand tokens resolve to that hue here and
          // nowhere else; a tone picks its tokens by class.
          <span
            aria-hidden="true"
            className={classNames(styles.tint, TONES.has(tint) && styles[`tint-${tint}`])}
            data-brand={TONES.has(tint) ? undefined : tint}
          />
        )}
        {children}
      </Flex>
    </ElementType>
  );
};

Card.displayName = "Card";

export { Card };
