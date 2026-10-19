import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from "react";
import type { BorderStyle, SolidType, SurfaceStyle } from "./contexts/ThemeProvider";
import type {
  BlendMode,
  BlurSize,
  Colors,
  CSSUnit,
  FlexValue,
  GridSize,
  Opacity,
  RadiusNest,
  RadiusSize,
  ShadowSize,
  SpacingToken,
  TextSize,
  TextType,
  TextVariant,
  TextWeight,
  UserSelect,
} from "./types";

export interface ResponsiveProps extends HTMLAttributes<HTMLDivElement> {
  top?: SpacingToken;
  right?: SpacingToken;
  bottom?: SpacingToken;
  left?: SpacingToken;
  hide?: boolean;
  position?: CSSProperties["position"];
  overflow?: CSSProperties["overflow"];
  overflowX?: CSSProperties["overflowX"];
  overflowY?: CSSProperties["overflowY"];
  aspectRatio?: CSSProperties["aspectRatio"];
  style?: CSSProperties;
}

export interface ResponsiveFlexProps extends ResponsiveProps {
  horizontal?: FlexProps["horizontal"];
  vertical?: FlexProps["vertical"];
  center?: boolean;
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
}

export interface ResponsiveGridProps extends ResponsiveProps {
  columns?: GridSize;
  rows?: GridSize;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** How many equal columns. Set it per breakpoint to reflow. */
  columns?: GridSize;
  /**
   * As many columns as fit, each at least this wide: the grid reflows on its
   * own, with no breakpoint objects. Takes the same values as `minWidth` — a
   * number is rem, a string is a spacing token or a CSS unit
   * (`%`, `vw`, `calc(…)`).
   *
   * Renders on the server: a `.columns-auto-fit` class plus the
   * `--grid-min-column-width` custom property on the same element. It takes
   * precedence over `columns`; a breakpoint `columns` still overrides it at
   * that width, e.g. `minColumnWidth={16} s={{ columns: 1 }}`.
   *
   * @example <Grid minColumnWidth={13} gap="8">…</Grid>
   */
  minColumnWidth?: number | SpacingToken | CSSUnit;
  /**
   * How many equal rows, as a class (`.rows-3`). Usually left alone — rows
   * follow from the content. Set it per breakpoint to reflow, as `columns`.
   */
  rows?: GridSize;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
}

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  center?: boolean;
  wrap?: boolean;
  flex?: FlexValue;
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
}

export interface TextProps<T extends ElementType = "span"> extends HTMLAttributes<T> {
  as?: T;
  variant?: TextVariant;
  wrap?: CSSProperties["textWrap"];
  size?: TextSize;
  weight?: TextWeight;
  family?: TextType;
  truncate?: boolean;
  /** Flex grow inside a Row or Column, e.g. a label that takes the free space: `<Text flex={1}>`. */
  flex?: FlexValue | number;
  /** Hide from this breakpoint down: `s={{ hide: true }}`. Text takes only `hide` here; anything else that changes at a breakpoint goes on a Row or Column wrapper. */
  xl?: TextBreakpointHide;
  l?: TextBreakpointHide;
  m?: TextBreakpointHide;
  s?: TextBreakpointHide;
  xs?: TextBreakpointHide;
}

export interface TextBreakpointHide {
  hide?: boolean;
}

export interface SizeProps extends HTMLAttributes<HTMLDivElement> {
  /** A number is rem; a string is a spacing token or a CSS unit. `"auto"` undoes a width, e.g. `width={20} s={{ width: "auto" }}`; `"fit"` is fit-content, like `fitWidth`. */
  width?: number | SpacingToken | CSSUnit | "auto" | "fit";
  /**
   * A number is rem; a string is a spacing token or a CSS unit.
   * `"below-header"` is the viewport below the app header,
   * `calc(100dvh - var(--header-height))`, for an app shell's scrolling pane.
   * `"fit"` is fit-content, like `fitHeight`.
   */
  height?: number | SpacingToken | CSSUnit | "below-header" | "fit";
  maxWidth?: number | SpacingToken | CSSUnit;
  minWidth?: number | SpacingToken | CSSUnit;
  /** As `height`, including `"below-header"`. */
  minHeight?: number | SpacingToken | CSSUnit | "below-header";
  /**
   * As `height`. `"below-header"` caps a panel that hangs from the header (a
   * mobile menu, a dropdown) at the viewport below it.
   */
  maxHeight?: number | SpacingToken | CSSUnit | "below-header";
  fit?: boolean;
  fitWidth?: boolean;
  fitHeight?: boolean;
  fill?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  aspectRatio?: CSSProperties["aspectRatio"];
}

export interface SpacingProps extends HTMLAttributes<HTMLDivElement> {
  padding?: SpacingToken | number;
  paddingLeft?: SpacingToken | number;
  paddingRight?: SpacingToken | number;
  paddingTop?: SpacingToken | number;
  paddingBottom?: SpacingToken | number;
  paddingX?: SpacingToken | number;
  paddingY?: SpacingToken | number;
  margin?: SpacingToken | number;
  marginLeft?: SpacingToken | number;
  marginRight?: SpacingToken | number;
  marginTop?: SpacingToken | number;
  marginBottom?: SpacingToken | number;
  marginX?: SpacingToken | number;
  marginY?: SpacingToken | number;
  gap?: SpacingToken | number | "-1";
  top?: SpacingToken | number | CSSUnit;
  right?: SpacingToken | number | CSSUnit;
  bottom?: SpacingToken | number | CSSUnit;
  left?: SpacingToken | number | CSSUnit;
  translateX?: SpacingToken | number | CSSUnit;
  translateY?: SpacingToken | number | CSSUnit;
}

/**
 * Surface and effect props. Each resolves to a utility class (or, for a
 * number, an inline value the server writes), so none of them moves `Flex` or
 * `Grid` to the client the way a `style` object does.
 *
 * `transform` is deliberately not among them: it is what animations drive, so
 * it stays in `style`. For a static offset, `translateX`/`translateY` do the
 * same job without one.
 */
export interface StyleProps extends HTMLAttributes<HTMLDivElement> {
  textVariant?: TextVariant;
  textSize?: TextSize;
  textType?: TextType;
  textWeight?: TextWeight;
  background?: Colors | "surface" | "overlay" | "page" | "transparent";
  solid?: Colors;
  borderTop?: Colors | "surface" | "transparent" | boolean;
  borderRight?: Colors | "surface" | "transparent" | boolean;
  borderBottom?: Colors | "surface" | "transparent" | boolean;
  borderLeft?: Colors | "surface" | "transparent" | boolean;
  borderX?: Colors | "surface" | "transparent" | boolean;
  borderY?: Colors | "surface" | "transparent" | boolean;
  border?: Colors | "surface" | "transparent" | boolean;
  borderStyle?: "solid" | "dashed";
  borderWidth?: 1 | 2 | 4 | 8 | "1" | "2" | "4" | "8";
  topRadius?: RadiusSize;
  rightRadius?: RadiusSize;
  bottomRadius?: RadiusSize;
  leftRadius?: RadiusSize;
  topLeftRadius?: RadiusSize;
  topRightRadius?: RadiusSize;
  bottomLeftRadius?: RadiusSize;
  bottomRightRadius?: RadiusSize;
  radius?: RadiusSize | `${RadiusSize}-${RadiusNest}`;
  shadow?: ShadowSize;
  cursor?: CSSProperties["cursor"] | "interactive" | ReactNode;
  /**
   * `mix-blend-mode`, as a class: how the element composites with what is
   * behind it. `color-dodge` and `plus-lighter` are the ones a glow wants.
   */
  blendMode?: BlendMode;
  /**
   * `filter: blur()`. A size (`xs` 0.25rem to `xl` 3rem) is a class; a number
   * is rem, written inline by the server. It sets the whole `filter`, so
   * combine it with other filter functions in `style` instead.
   */
  blur?: BlurSize | number;
  /**
   * `backdrop-filter: blur()` — frosts what shows through a translucent
   * background. Same scale as `blur`; a number is rem. Wins over the backdrop
   * blur `background="surface"` brings with a translucent theme.
   */
  backdropBlur?: BlurSize | number;
  /**
   * Render this subtree in the light or dark theme, whatever the page is in:
   * `data-theme` on this element, typed. Not the same as the `dark` and
   * `light` booleans, which show or hide an element depending on the theme
   * around it and change nothing about its colours.
   *
   * @example <Column theme="dark" background="page">…</Column>
   */
  theme?: "light" | "dark";
  /**
   * The subtree's corner style — `ThemeProvider`'s `border`, as `data-border`.
   * Named apart from `border`, which on a layout primitive is a border colour.
   */
  themeBorder?: BorderStyle;
  /**
   * The subtree's solid fill style — `ThemeProvider`'s `solid`, as
   * `data-solid`. Named apart from `solid`, which here is a fill colour.
   */
  themeSolid?: SolidType;
  /** The subtree's surface style — `ThemeProvider`'s `surface`, as `data-surface`. */
  themeSurface?: SurfaceStyle;
}

export interface DisplayProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  inline?: boolean;
  hide?: boolean;
  pointerEvents?: "none" | "all" | "auto";
  /**
   * `user-select`, as a class: `none` keeps a drag handle, a timeline label or
   * a control's text from being selected mid-gesture.
   */
  userSelect?: UserSelect;
  position?: CSSProperties["position"];
  /**
   * `auto`, `scroll`, `hidden`, `clip` and `visible` each map to a utility
   * class, at the base and in every breakpoint object, so they stay
   * server-rendered. `clip` cuts the content off without making the element a
   * scroll container, which keeps `position: sticky` working inside it.
   */
  overflow?: CSSProperties["overflow"];
  /** The horizontal axis of `overflow`; the same five values have classes. */
  overflowX?: CSSProperties["overflowX"];
  /** The vertical axis of `overflow`; the same five values have classes. */
  overflowY?: CSSProperties["overflowY"];
  scrollbar?: "default" | "minimal";
  transition?:
    | "micro-short"
    | "micro-medium"
    | "micro-long"
    | "macro-short"
    | "macro-medium"
    | "macro-long";
  opacity?: Opacity;
  zIndex?:
    | -1
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | "-1"
    | "0"
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10";
  /**
   * Show this element only while the theme around it is dark. It changes
   * nothing about the element's colours: to render a subtree dark, use
   * `theme="dark"`.
   */
  dark?: boolean;
  /**
   * Show this element only while the theme around it is light. To render a
   * subtree light, use `theme="light"`.
   */
  light?: boolean;
}

export interface CommonProps extends Omit<HTMLAttributes<HTMLDivElement>, "style"> {
  onBackground?: Colors;
  onSolid?: Colors;
  align?: CSSProperties["textAlign"];
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

// ============================================================================
// Generic Breakpoint Type System
// ============================================================================
// BreakpointProps<Source, Keys> picks specific keys from a source interface
// and makes them optional. This ensures each component's breakpoint type
// only includes props that component actually supports.
//
// Usage:
//   type FlexBreakpointProps = BreakpointProps<AllFlexProps, 'direction' | 'padding' | ...>;
//   type GridBreakpointProps = BreakpointProps<AllGridProps, 'columns' | 'padding' | ...>;
//   type TextBreakpointProps = BreakpointProps<AllTextProps, 'textVariant' | 'align' | ...>;
// ============================================================================

// Union of all prop interfaces available to Flex-derived components
type AllFlexProps = FlexProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

// Union of all prop interfaces available to Grid-derived components
type AllGridProps = GridProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

// Union of all prop interfaces available to Text-derived components
type AllTextProps = TextProps & CommonProps & SpacingProps & DisplayProps;

// Generic breakpoint type: picks Keys from Source and makes them optional
export type BreakpointProps<Source, Keys extends keyof Source> = {
  [K in Keys]?: Source[K];
};

// ============================================================================
// Flex Breakpoint Props
// Supports: layout, spacing, sizing, colors, typography, effects, position
// ============================================================================
export type FlexBreakpointProps = BreakpointProps<
  AllFlexProps,
  // Layout
  | "direction"
  | "horizontal"
  | "vertical"
  | "center"
  | "wrap"
  | "flex"
  // Spacing
  | "padding"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "marginBottom"
  | "marginX"
  | "marginY"
  | "gap"
  // Position offsets
  | "top"
  | "right"
  | "bottom"
  | "left"
  // Sizing
  | "width"
  | "height"
  | "maxWidth"
  | "minWidth"
  | "minHeight"
  | "maxHeight"
  | "fit"
  | "fitWidth"
  | "fitHeight"
  | "fill"
  | "fillWidth"
  | "fillHeight"
  | "aspectRatio"
  // Colors
  | "background"
  | "solid"
  | "border"
  | "borderTop"
  | "borderRight"
  | "borderBottom"
  | "borderLeft"
  | "borderX"
  | "borderY"
  | "borderStyle"
  | "borderWidth"
  | "radius"
  | "shadow"
  | "onBackground"
  | "onSolid"
  // Typography
  | "align"
  | "textVariant"
  | "textSize"
  | "textWeight"
  | "textType"
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  | "dark"
  | "light"
  // Display / position
  | "position"
  | "hide"
  | "overflow"
  | "overflowX"
  | "overflowY"
  // Escape hatch
  | "style"
>;

// ============================================================================
// Grid Breakpoint Props
// Supports: grid-specific, spacing, sizing, colors, typography, effects, position
// Does NOT support: direction, horizontal, vertical, center, wrap, flex
// ============================================================================
export type GridBreakpointProps = BreakpointProps<
  AllGridProps,
  // Grid-specific
  | "columns"
  | "rows"
  // Spacing
  | "padding"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "marginBottom"
  | "marginX"
  | "marginY"
  | "gap"
  // Position offsets
  | "top"
  | "right"
  | "bottom"
  | "left"
  // Sizing
  | "width"
  | "height"
  | "maxWidth"
  | "minWidth"
  | "minHeight"
  | "maxHeight"
  | "fit"
  | "fitWidth"
  | "fitHeight"
  | "fill"
  | "fillWidth"
  | "fillHeight"
  | "aspectRatio"
  // Colors
  | "background"
  | "solid"
  | "border"
  | "borderTop"
  | "borderRight"
  | "borderBottom"
  | "borderLeft"
  | "borderX"
  | "borderY"
  | "borderStyle"
  | "borderWidth"
  | "radius"
  | "shadow"
  | "onBackground"
  | "onSolid"
  // Typography
  | "align"
  | "textVariant"
  | "textSize"
  | "textWeight"
  | "textType"
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  | "dark"
  | "light"
  // Display / position
  | "position"
  | "hide"
  | "overflow"
  | "overflowX"
  | "overflowY"
  // Escape hatch
  | "style"
>;

// ============================================================================
// Text Breakpoint Props
// Supports: typography, spacing, display effects, position
// Does NOT support: layout (direction, horizontal, etc.), sizing, colors, border
// ============================================================================
export type TextBreakpointProps = BreakpointProps<
  AllTextProps,
  // Typography
  | "variant"
  | "size"
  | "weight"
  | "family"
  | "align"
  | "wrap"
  // Spacing
  | "padding"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "marginBottom"
  | "marginX"
  | "marginY"
  | "gap"
  // Position offsets
  | "top"
  | "right"
  | "bottom"
  | "left"
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  | "dark"
  | "light"
  // Display / position
  | "position"
  | "hide"
  | "overflow"
  | "overflowX"
  | "overflowY"
  // Escape hatch
  | "style"
>;

// ============================================================================
// Button Breakpoint Props
// Supports: spacing, colors, typography, border/radius, effects
// Does NOT support: layout, sizing, overflow
// ============================================================================
export type ButtonBreakpointProps = BreakpointProps<
  SpacingProps & StyleProps & CommonProps & DisplayProps,
  // Spacing
  | "padding"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "marginBottom"
  | "marginX"
  | "marginY"
  | "gap"
  // Colors
  | "background"
  | "solid"
  | "border"
  | "borderTop"
  | "borderRight"
  | "borderBottom"
  | "borderLeft"
  | "borderX"
  | "borderY"
  | "borderStyle"
  | "borderWidth"
  | "radius"
  | "shadow"
  | "onBackground"
  | "onSolid"
  // Typography
  | "align"
  | "textVariant"
  | "textSize"
  | "textWeight"
  | "textType"
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  | "dark"
  | "light"
  // Escape hatch
  | "style"
>;

// ============================================================================
// Input Breakpoint Props
// Supports: spacing, colors, border, typography, effects
// Does NOT support: layout, sizing, overflow
// ============================================================================
export type InputBreakpointProps = BreakpointProps<
  SpacingProps & StyleProps & CommonProps & DisplayProps,
  // Spacing
  | "padding"
  | "paddingLeft"
  | "paddingRight"
  | "paddingTop"
  | "paddingBottom"
  | "paddingX"
  | "paddingY"
  | "margin"
  | "marginLeft"
  | "marginRight"
  | "marginTop"
  | "marginBottom"
  | "marginX"
  | "marginY"
  | "gap"
  // Colors
  | "background"
  | "solid"
  | "border"
  | "borderTop"
  | "borderRight"
  | "borderBottom"
  | "borderLeft"
  | "borderX"
  | "borderY"
  | "borderStyle"
  | "borderWidth"
  | "radius"
  | "shadow"
  | "onBackground"
  | "onSolid"
  // Typography
  | "align"
  | "textVariant"
  | "textSize"
  | "textWeight"
  | "textType"
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  | "dark"
  | "light"
  // Escape hatch
  | "style"
>;

// ============================================================================
// Backward-compatible interfaces (deprecated, use types above)
// These are kept for existing code that references them by name.
// ============================================================================
/**
 * @deprecated Use the breakpoint type of the component being styled —
 * `FlexBreakpointProps`, `GridBreakpointProps` or `TextBreakpointProps` —
 * which carry `position` and `hide` along with everything else a breakpoint
 * can set. Kept for code that names it; nothing in the package uses it.
 */
export interface BaseBreakpointProps {
  position?: CSSProperties["position"];
  hide?: boolean;
}
