"use client";

import classNames from "clsx";
import type React from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { Flex } from "./Flex.js";
import iconStyles from "./Icon.module.scss";
import styles from "./NavIcon.module.scss";

const MENU = [
  ["top", "M4 6.75L20 6.75"],
  ["middle", "M4 12L20 12"],
  ["bottom", "M4 17.25L20 17.25"],
] as const;

interface NavIconProps extends LeafPropsOf<"div"> {
  onClick?: () => void;
  /** Whether the menu it toggles is open: the lines turn into a cross, and
   *  `aria-expanded` follows. Without it the button reports no state. */
  active: boolean;
}

/**
 * The menu toggle, drawn as the built-in `menu` icon: given `active`, its
 * lines fold into the `close` cross in the same spot, so a header never moves
 * its button between open and closed. It is the menu icon with Icon's `active` motion, so
 * the fold has the icon motion's timing for the theme's border shape, and is
 * off under `prefers-reduced-motion`.
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
      {/* The built-in menu icon (src/icons/data.ts), inlined so a header
          doesn't carry the whole icon set, moved by Icon's motion styles. */}
      <span
        className={classNames(iconStyles.icon, iconStyles.s, styles.glyph)}
        data-icon="menu"
        data-animate="active"
        data-active={active ? "" : undefined}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {MENU.map(([part, d]) => (
            <path key={part} data-part={part} d={d} />
          ))}
        </svg>
      </span>
    </Flex>
  );
};

NavIcon.displayName = "NavIcon";

export { NavIcon };
