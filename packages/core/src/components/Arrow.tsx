"use client";

import classNames from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import { composeTransform, translateTransform } from "../utils/layoutClasses.js";
import styles from "./Arrow.module.scss";
import { Flex } from "./Flex.js";

interface ArrowProps extends Omit<React.ComponentProps<typeof Flex>, "children" | "color"> {
  /**
   * A CSS selector for the element whose hover draws the arrow (`"#plan-pro"`):
   * a card, a link or a row around it. The arrow slides in while the pointer
   * is over that element.
   */
  trigger: string;
  /** The arrow's size, as a multiplier of its 16px box. */
  scale?: number;
  /** Drawn for a background (`onBackground`, the default) or on a solid fill. */
  color?: "onBackground" | "onSolid";
}

/**
 * The animated arrow Button `arrowIcon` and Tag `arrow` draw, on its own: put
 * it in a card or a link and point `trigger` at that element. Its layout props
 * are Flex's (a number is px).
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
      center
      aria-hidden="true"
      className={classNames(styles.arrowContainer, className)}
      style={{
        // The scale composes with a translate prop instead of replacing the
        // transform Flex would have written for it.
        transform: composeTransform(translateTransform(translateX, translateY), `scale(${scale})`),
        ...style,
      }}
      {...flex}
    >
      <Flex
        radius="full"
        position="absolute"
        className={classNames(styles.arrowHead, styles[color])}
        height="0.0875rem"
      />
      <Flex
        radius="full"
        position="absolute"
        className={classNames(styles.arrowHead, styles[color])}
        height="0.0875rem"
      />
    </Flex>
  );
};

Arrow.displayName = "Arrow";

export type { ArrowProps };
export { Arrow };
