"use client";

import type React from "react";
import { createContext, type ReactNode, useContext } from "react";
import { useStyle } from "../contexts/ThemeProvider.js";
import type { SpacingToken } from "../types.js";
import type { Density } from "../utils/density.js";
import { Column } from "./Column.js";
import { Row } from "./Row.js";

/** The theme-wide density (`style.density`), which a Nav follows unless it sets its own. */
type NavDensity = Density;
type NavVariant = "solid" | "subtle" | "minimal";

interface NavStyle {
  density: NavDensity;
  variant: NavVariant;
  rail: boolean;
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

const OUTSIDE: NavStyle = { density: "normal", variant: "solid", rail: true };

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
   * size; it also drops the text to the small label. Left out, the theme's
   * `density` (ThemeProvider, `style.density` in the config); set, it wins
   * for this Nav.
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
}

/**
 * A sidebar's navigation: sets density, variant and rail once for every
 * NavItem, NavGroup and NavSection inside it. The rows still work without it,
 * at the defaults.
 */
const Nav = ({
  ref,
  density: own,
  variant = "solid",
  rail = true,
  children,
  ...column
}: NavProps) => {
  const theme = useStyle().density;
  // One scale for the theme and the Nav: an unknown value falls back to normal.
  const density: NavDensity = own ?? (theme in DENSITY ? theme : "normal");
  return (
    <NavContext.Provider value={{ density, variant, rail }}>
      <Column
        ref={ref}
        as="nav"
        fillWidth
        gap={DENSITY[density].gap}
        data-density={density}
        data-variant={variant}
        {...column}
      >
        {children}
      </Column>
    </NavContext.Provider>
  );
};

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
const NavSection = ({ ref, label, action, children, ...column }: NavSectionProps) => {
  const { sizes } = useNavStyle();
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
        >
          {label}
          {action}
        </Row>
      )}
      {children}
    </Column>
  );
};

NavSection.displayName = "NavSection";

export type { NavDensity, NavProps, NavSectionProps, NavVariant };
export { Nav, NavSection, useNavStyle };
