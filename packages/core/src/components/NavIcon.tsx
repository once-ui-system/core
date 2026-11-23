"use client";

import classNames from "clsx";
import type React from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { Flex } from "./Flex.js";
import styles from "./NavIcon.module.scss";

interface NavIconProps extends LeafPropsOf<"div"> {
  onClick?: () => void;
  /** Whether the menu it toggles is open: the lines turn into a cross, and
   *  `aria-expanded` follows. Without it the button reports no state. */
  active: boolean;
}

/**
 * The menu toggle, drawn as the built-in `menu` icon: given `active`, its
 * lines fold into the `close` cross in the same spot, so a header never moves
 * its button between open and closed. The motion is off under
 * `prefers-reduced-motion`.
 *
 * A button named "Menu" (or by `aria-label`), operated with
 * Enter and Space as well as a click. Given `active`, the state of the menu
 * it controls, it is a disclosure button whose `aria-expanded` follows it;
 * point `aria-controls` at the menu while it is rendered.
 *
 * It was a focusable `div` with no role, no name and no keyboard handling, so
 * a keyboard could reach it but never press it, and a screen reader announced
 * nothing at all.
 */
const NavIcon = ({
  ref,
  className,
  active,
  style,
  onClick,
  onKeyDown,
  ...rest
}: Partial<NavIconProps>) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      // Space would scroll the page; Enter on a div does nothing natively.
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <Flex
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Menu"
      aria-expanded={active}
      radius="m"
      center
      cursor="interactive"
      width="40"
      height="40"
      minHeight="40"
      minWidth="40"
      className={classNames(styles.navIcon, className)}
      style={style}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className={classNames(styles.glyph, active && styles.active)}
      >
        <path className={styles.top} d="M4 6.75L20 6.75" />
        <path className={styles.middle} d="M4 12L20 12" />
        <path className={styles.bottom} d="M4 17.25L20 17.25" />
      </svg>
    </Flex>
  );
};

NavIcon.displayName = "NavIcon";

export { NavIcon };
