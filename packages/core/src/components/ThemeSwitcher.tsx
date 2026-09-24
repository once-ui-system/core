"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import { useTheme } from "../contexts/ThemeProvider";
import { Column } from "./Column";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
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
  /**
   * Which way a collapsed group opens. Ignored when not `collapsed`.
   *
   * `"row"` grows sideways in the flow of the layout, which is right when the
   * control has room beside it and wrong when it has neighbours: the group
   * widening pushes them along, and the option you were pointing at moves out
   * from under the pointer.
   *
   * `"column"` lifts the options into a panel over the page and opens it
   * downwards, so the control keeps a one-option footprint whatever it is
   * doing and nothing around it moves. Downwards rather than centred on the
   * active option: the open panel is taller than a typical header, so
   * anchoring it on the second or third option would put its top edge above
   * the viewport.
   */
  direction?: "row" | "column";
}

const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>(
  ({ collapsed, direction = "row", className, ...flex }, ref) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    // Two frames after `mounted` has committed, so a collapsed group appears
    // only once the browser has laid it out showing the right option (see
    // `.pending`). One frame is not enough: its callback runs before that
    // frame's style pass, which would see the new classes and the reveal
    // together and animate the swap.
    const [ready, setReady] = React.useState(false);

    // The server does not know the visitor's theme, so nothing is marked active
    // until the client says which one it is.
    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      if (!mounted) return;
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setReady(true));
      });
      return () => cancelAnimationFrame(frame);
    }, [mounted]);

    const pending = collapsed && !ready;

    /*
     * Opening downwards, the active option leads.
     *
     * The shut control is the active option — that is what a collapsed group
     * is. Open it in fixed order and the panel's first slot belongs to
     * whichever theme happens to be listed first, so the icon the pointer is
     * already resting on changes identity as the panel unrolls: you hover the
     * moon and the computer arrives underneath your cursor. Click without
     * looking and you have set the wrong theme.
     *
     * Leading with the active option keeps one invariant instead — the theme
     * in force is always the one in the anchor slot, before opening and again
     * after choosing. The other two keep their order relative to each other,
     * so the list is still predictable.
     *
     * Reordered here rather than with CSS `order` so that the tab order and
     * the visual order stay the same thing. Keys are stable, so React moves
     * the existing nodes and a focused button keeps its focus.
     */
    const ordered =
      collapsed && direction === "column" && mounted
        ? [...THEMES].sort((a, b) => Number(theme === b.value) - Number(theme === a.value))
        : THEMES;

    const options = ordered.map(({ value, icon, label }, index) => {
      const active = mounted && theme === value;
      return (
        <Row
          key={value}
          fit
          // Before mount no option is known to be active, so a collapsed group
          // keeps just its first slot open: the one-option footprint it will
          // have, held invisible by `.pending` until the right option is in it.
          className={classNames(styles.option, (mounted ? !active : index > 0) && styles.inactive)}
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
    });

    /*
     * Opening downwards needs two elements, not one.
     *
     * The outer box is what the layout sees, and it stays the size of a single
     * option however many are showing — that is the whole point of the
     * collapsed control, and a group that grows in the flow would push its
     * neighbours along every time it opened. The panel is taken out of the
     * flow and hung from the outer box's top-left, so it grows over the page
     * instead of through the header.
     *
     * The border and the radius move to the panel with the options, because
     * they belong to the thing that is actually visible.
     */
    if (collapsed && direction === "column") {
      return (
        <Row
          data-border="rounded"
          ref={ref}
          fit
          className={classNames(styles.anchor, pending && styles.pending, className)}
          suppressHydrationWarning
          {...flex}
        >
          <Column
            gap="2"
            border="neutral-alpha-weak"
            radius="full"
            background="page"
            className={classNames(styles.collapsed, styles.panel)}
            suppressHydrationWarning
          >
            {options}
          </Column>
        </Row>
      );
    }

    return (
      <Row
        data-border="rounded"
        ref={ref}
        gap="2"
        border="neutral-alpha-weak"
        radius="full"
        suppressHydrationWarning
        className={classNames(collapsed && styles.collapsed, pending && styles.pending, className)}
        {...flex}
      >
        {options}
      </Row>
    );
  },
);

ThemeSwitcher.displayName = "ThemeSwitcher";

export { ThemeSwitcher };
