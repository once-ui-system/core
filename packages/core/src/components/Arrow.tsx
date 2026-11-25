"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { composeTransform, translateTransform } from "../utils/layoutClasses.js";
import styles from "./Arrow.module.scss";
import { Flex } from "./Flex.js";

const ARROW_SHAFT = "M5.25 12L17.75 12";
const ARROW_HEAD = "M12.5 5.75L18.75 12L12.5 18.25";

interface ArrowProps extends Omit<React.ComponentProps<typeof Flex>, "children" | "color"> {
  /**
   * A CSS selector for the element whose hover draws the arrow (`"#plan-pro"`).
   * Rarely needed: the arrow already follows the link, button or
   * `data-arrow-trigger` element around it, with CSS alone (keyboard focus
   * too). Pass it only when the element is not an ancestor.
   */
  trigger?: string;
  /** The arrow's size, as a multiplier of its 16px box. */
  scale?: number;
  /** Drawn for a background (`onBackground`, the default) or on a solid fill. */
  color?: "onBackground" | "onSolid";
  /** `"span"` inside phrasing content, such as a Tag in a sentence. Defaults to `"div"`. */
  as?: "div" | "span";
}

/**
 * The animated arrow Button `arrowIcon` and Tag `arrow` draw, on its own: the
 * `arrowRight` icon's head as a chevron at rest; while the link, button or
 * `data-arrow-trigger` element around it is hovered or keyboard-focused, the
 * shaft grows in and the head moves forward. CSS only, timed by the theme's
 * border shape like every icon motion. Its layout props are Flex's (a number
 * is on the token scale).
 */
const Arrow = ({
  ref,
  trigger,
  scale = 0.8,
  color = "onBackground",
  style,
  className,
  translateX,
  translateY,
  as,
  ...flex
}: ArrowProps) => {
  const node = useRef<HTMLDivElement | null>(null);

  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      node.current = element;
      if (typeof ref === "function") ref(element);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = element;
    },
    [ref],
  );

  useEffect(() => {
    if (!trigger) return;
    const triggerElement = document.querySelector(trigger);
    if (!triggerElement) return;

    const handleMouseOver = () => node.current?.classList.add(styles.active);
    const handleMouseOut = () => node.current?.classList.remove(styles.active);

    triggerElement.addEventListener("mouseenter", handleMouseOver);
    triggerElement.addEventListener("mouseleave", handleMouseOut);

    return () => {
      triggerElement.removeEventListener("mouseenter", handleMouseOver);
      triggerElement.removeEventListener("mouseleave", handleMouseOut);
    };
  }, [trigger]);

  return (
    <Flex
      ref={setRef}
      as={as}
      center
      aria-hidden="true"
      className={classNames(styles.arrowContainer, styles[color], className)}
      style={{
        // The scale composes with a translate prop instead of replacing the
        // transform Flex would have written for it.
        transform: composeTransform(translateTransform(translateX, translateY), `scale(${scale})`),
        ...style,
      }}
      {...flex}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={styles.glyph}
      >
        {/* The built-in arrowRight's two parts (src/icons/data.ts), inlined so
            the arrow doesn't carry the whole icon set. */}
        <path data-part="shaft" d={ARROW_SHAFT} />
        <path data-part="head" d={ARROW_HEAD} />
      </svg>
    </Flex>
  );
};

Arrow.displayName = "Arrow";

export type { ArrowProps };
export { Arrow };
