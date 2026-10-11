"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import { Flex } from "./Flex";
import styles from "./NavIcon.module.scss";

interface NavIconProps extends React.ComponentProps<typeof Flex> {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  /** Whether the menu it toggles is open: the lines turn into a cross, and
   *  `aria-expanded` follows. Without it the button reports no state. */
  active: boolean;
}

/**
 * The menu toggle: a button named "Menu" (or by `aria-label`), operated with
 * Enter and Space as well as a click. Given `active`, the state of the menu
 * it controls, it is a disclosure button whose `aria-expanded` follows it;
 * point `aria-controls` at the menu while it is rendered.
 *
 * It was a focusable `div` with no role, no name and no keyboard handling, so
 * a keyboard could reach it but never press it, and a screen reader announced
 * nothing at all.
 */
const NavIcon = forwardRef<HTMLDivElement, Partial<NavIconProps>>(
  ({ className, active, style, onClick, onKeyDown, ...rest }, ref) => {
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
        cursor="interactive"
        width="40"
        height="40"
        minHeight="40"
        minWidth="40"
        className={className}
        style={style}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className={classNames(styles.line, active && styles.active)} />
        <div className={classNames(styles.line, active && styles.active)} />
      </Flex>
    );
  },
);

NavIcon.displayName = "NavIcon";

export { NavIcon };
