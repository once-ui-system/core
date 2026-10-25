"use client";

import classNames from "clsx";
import type React from "react";
import {
  createContext,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SpacingToken } from "../types";
import { Column } from "./Column";
import styles from "./Nav.module.scss";
import { Row } from "./Row";

type NavDensity = "compact" | "normal" | "spacious";
type NavVariant = "solid" | "subtle" | "minimal";

interface NavStyle {
  density: NavDensity;
  variant: NavVariant;
  rail: boolean;
  /** Icons only right now: a collapsed Nav that is not expanded over the page. */
  collapsed: boolean;
}

/**
 * The sizes behind each density. `toggle` is the ToggleButton size a row
 * borrows its height and padding from; spacious keeps the `l` padding and
 * only grows the row, so the text column lines up with a normal nav.
 */
const DENSITY = {
  compact: {
    toggle: "m",
    text: "s",
    height: "32",
    gap: "2",
    iconGap: "8",
    section: "xs",
    group: { size: "s", inset: "12", top: "4", bottom: "8" },
  },
  normal: {
    toggle: "l",
    text: "m",
    height: "40",
    gap: "4",
    iconGap: "12",
    section: "s",
    group: { size: "m", inset: "24", top: "8", bottom: "16" },
  },
  spacious: {
    toggle: "l",
    text: "m",
    height: "48",
    gap: "4",
    iconGap: "12",
    section: "s",
    group: { size: "m", inset: "24", top: "8", bottom: "16" },
  },
} as const satisfies Record<
  NavDensity,
  {
    toggle: "m" | "l";
    text: "s" | "m";
    height: SpacingToken;
    gap: SpacingToken;
    iconGap: SpacingToken;
    section: "xs" | "s";
    /**
     * The NavGroup's Accordion size, the header inset that puts its icon in
     * line with a NavItem's, and the space above and below its rows.
     */
    group: { size: "s" | "m"; inset: SpacingToken; top: SpacingToken; bottom: SpacingToken };
  }
>;

const OUTSIDE: NavStyle = { density: "normal", variant: "solid", rail: true, collapsed: false };

/** Hover intent: a pointer crossing the rail on its way to the page does not open it. */
const OPEN_DELAY = 150;
/** Grace period, so overshooting the open edge by a few pixels does not snap it shut. */
const CLOSE_DELAY = 200;

const NavContext = createContext<NavStyle>(OUTSIDE);

/**
 * The look the nearest Nav set, or the defaults outside one. `inNav` says
 * which, for parts such as Sortable that only adapt inside a Nav.
 */
const useNavStyle = () => {
  const style = useContext(NavContext);
  return { ...style, inNav: style !== OUTSIDE, sizes: DENSITY[style.density] };
};

interface NavProps extends React.ComponentProps<typeof Column> {
  /**
   * How tight the rows sit: 32, 40 or 48px tall. Compact is the dashboard
   * size; it also drops the text to the small label.
   */
  density?: NavDensity;
  /**
   * How the current page stands out. `solid` fills its row. `subtle` fills it
   * and also dims every other row, the docs look. `minimal` drops fills
   * altogether and marks the current row by weight and contrast alone.
   */
  variant?: NavVariant;
  /** The vertical line down an open NavGroup. Off, the children keep the indent. */
  rail?: boolean;
  /**
   * Icons only. Labels, badges and section headings fade out but stay each
   * row's accessible name, and NavGroups close. The Nav narrows to one icon
   * column plus its own padding.
   */
  collapsed?: boolean;
  /**
   * With `collapsed`, open over the page, labels and all, while a mouse rests
   * on it or the keyboard is in it, instead of showing a tooltip per icon.
   * The Nav keeps its collapsed width in the layout, so nothing beside it
   * moves. Touch never opens it.
   */
  expandOnHover?: boolean;
  /** How wide `expandOnHover` opens: a number of rem or a spacing token. */
  expandedWidth?: number | SpacingToken;
}

/**
 * A sidebar's navigation: sets density, variant and rail once for every
 * NavItem, NavGroup and NavSection inside it. The rows still work without it,
 * at the defaults.
 */
const Nav = forwardRef<HTMLDivElement, NavProps>(
  (
    {
      density = "normal",
      variant = "solid",
      rail = true,
      collapsed = false,
      expandOnHover = false,
      expandedWidth = 16,
      className,
      style,
      children,
      ...column
    },
    ref,
  ) => {
    const { expanded, handlers } = useHoverExpand(collapsed && expandOnHover, column);
    const iconsOnly = collapsed && !expanded;
    return (
      <NavContext.Provider value={{ density, variant, rail, collapsed: iconsOnly }}>
        <Column
          ref={ref}
          as="nav"
          fillWidth={!collapsed}
          gap={DENSITY[density].gap}
          data-density={density}
          data-variant={variant}
          data-collapsed={collapsed ? (expanded ? "expanded" : "collapsed") : undefined}
          className={classNames(
            collapsed && styles.collapsed,
            collapsed && expandOnHover && styles.expandable,
            expanded && styles.expanded,
            className,
          )}
          style={
            collapsed && expandOnHover
              ? ({
                  "--nav-expanded-width":
                    typeof expandedWidth === "number"
                      ? `${expandedWidth}rem`
                      : `var(--static-space-${expandedWidth})`,
                  ...style,
                } as React.CSSProperties)
              : style
          }
          {...column}
          {...handlers}
        >
          {children}
        </Column>
      </NavContext.Provider>
    );
  },
);

type HoverHandlers = Pick<
  React.ComponentProps<typeof Column>,
  "onPointerEnter" | "onPointerLeave" | "onFocus" | "onBlur" | "onKeyDown"
>;

/** `:focus-visible` is the keyboard's focus; a click focuses a row too, and must not pin the Nav open. */
const isKeyboardFocus = (el: Element) => {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
};

/**
 * Open on a resting mouse or on keyboard focus, close on leave, blur or
 * Escape. The host's own handlers still run.
 */
function useHoverExpand(enabled: boolean, own: HoverHandlers) {
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const schedule = (next: boolean, delay: number) => {
    cancel();
    timer.current = setTimeout(() => setExpanded(next), delay);
  };
  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    if (!enabled) {
      cancel();
      setExpanded(false);
    }
  }, [enabled, cancel]);

  if (!enabled) return { expanded: false, handlers: {} as HoverHandlers };

  const handlers: HoverHandlers = {
    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
      own.onPointerEnter?.(event);
      if (event.pointerType === "mouse") schedule(true, OPEN_DELAY);
    },
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      own.onPointerLeave?.(event);
      if (event.pointerType === "mouse") schedule(false, CLOSE_DELAY);
    },
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      own.onFocus?.(event);
      if (isKeyboardFocus(event.target)) {
        cancel();
        setExpanded(true);
      }
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      own.onBlur?.(event);
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        cancel();
        setExpanded(false);
      }
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      own.onKeyDown?.(event);
      if (event.key === "Escape") {
        cancel();
        setExpanded(false);
      }
    },
  };
  return { expanded, handlers };
}

Nav.displayName = "Nav";

interface NavSectionProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  /** The heading over the rows. Omit it for an untitled block. */
  label?: ReactNode;
  /** A control at the end of the heading, such as an add button. */
  action?: ReactNode;
}

/**
 * A titled block of rows: "Projects", "Pinned", "Resources". The heading is
 * small and dim at every variant so the rows stay the thing you read.
 */
const NavSection = forwardRef<HTMLDivElement, NavSectionProps>(
  ({ label, action, children, ...column }, ref) => {
    const { sizes, collapsed } = useNavStyle();
    return (
      <Column ref={ref} fillWidth gap={sizes.gap} {...column}>
        {(label || action) && (
          <Row
            fillWidth
            vertical="center"
            horizontal="between"
            gap="8"
            minHeight="24"
            paddingLeft={sizes.toggle === "m" ? "12" : "16"}
            paddingRight="4"
            paddingTop="8"
            textVariant={`label-default-${sizes.section}`}
            onBackground="neutral-weak"
            opacity={collapsed ? 0 : 100}
            transition="micro-medium"
          >
            {label}
            {action}
          </Row>
        )}
        {children}
      </Column>
    );
  },
);

NavSection.displayName = "NavSection";

export type { NavDensity, NavProps, NavSectionProps, NavVariant };
export { Nav, NavSection, useNavStyle };
