"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import { IconButton, Row } from ".";
import { useTheme } from "../contexts";
import styles from "./ThemeSwitcher.module.scss";

const THEMES = [
  { value: "system", icon: "computer", label: "System theme" },
  { value: "dark", icon: "dark", label: "Dark theme" },
  { value: "light", icon: "light", label: "Light theme" },
] as const;

interface ThemeSwitcherProps extends React.ComponentProps<typeof Row> {
  /**
   * Show only the active theme, and reveal the rest on hover or focus.
   *
   * For places where the control has to be reachable but should not spend three
   * slots of a header on itself. It stays a real toggle group: every option
   * keeps its tab stop, focus opens the group, and a device that cannot hover
   * gets all three from the start rather than a button that changes the theme
   * when it was tapped to open something.
   */
  collapsed?: boolean;
}

const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ collapsed, className, ...flex }, ref) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // The server does not know the visitor's theme, so nothing is marked active
    // until the client says which one it is.
    React.useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <Row
        data-border="rounded"
        ref={ref}
        gap="2"
        border="neutral-alpha-weak"
        radius="full"
        suppressHydrationWarning
        className={classNames(collapsed && styles.collapsed, className)}
        {...flex}
      >
        {THEMES.map(({ value, icon, label }) => {
          const active = mounted && theme === value;
          return (
            <Row
              key={value}
              fit
              // Collapsed, an unresolved theme would hide all three and leave an
              // empty pill, so before mount the group renders open.
              className={classNames(styles.option, mounted && !active && styles.inactive)}
              suppressHydrationWarning
            >
              <IconButton
                icon={icon}
                variant={active ? "primary" : "tertiary"}
                onClick={() => setTheme(value)}
                aria-label={label}
                aria-pressed={active}
                suppressHydrationWarning
              />
            </Row>
          );
        })}
      </Row>
    );
  },
);

ThemeSwitcher.displayName = "ThemeSwitcher";
export { ThemeSwitcher };
