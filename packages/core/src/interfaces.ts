import type {
  ComponentPropsWithRef,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";
import type { BorderStyle, SolidType, SurfaceStyle } from "./contexts/ThemeProvider.js";
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
  TextType,
  TextVariant,
  TextWeight,
  UserSelect,
} from "./types.js";

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

export interface GridProps {
  /** How many equal columns. Set it per breakpoint to reflow. */
  columns?: GridSize;
  /**
   * As many columns as fit, each at least this wide: the grid reflows on its
   * own, with no breakpoint objects. Takes the same values as `minWidth` — a
   * number is on the token scale, a string is a spacing token or a CSS length
   * (`"16rem"`, `"40%"`, `calc(…)`).
   *
   * Renders on the server: a `.columns-auto-fit` class plus the
   * `--grid-min-column-width` custom property on the same element. It takes
   * precedence over `columns`; a breakpoint `columns` still overrides it at
   * that width, e.g. `minColumnWidth={256} s={{ columns: 1 }}`.
   *
   * @example <Grid minColumnWidth={208} gap="8">…</Grid>
   */
  minColumnWidth?: number | SpacingToken | CSSUnit;
  /**
   * How many equal rows, as a class (`.rows-3`). Usually left alone — rows
   * follow from the content. Set it per breakpoint to reflow, as `columns`.
   */
  rows?: GridSize;
  xl?: GridBreakpointProps;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
  xs?: GridBreakpointProps;
}

export interface FlexProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  horizontal?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
  /**
   * Alignment on the vertical axis. `"baseline"` lines the children up on
   * their first line of text (`align-items: baseline`), for a price beside its
   * unit or a label beside a large number; it is a cross-axis value, so on a
   * column it applies to the horizontal axis.
   */
  vertical?: "start" | "center" | "end" | "between" | "around" | "even" | "stretch" | "baseline";
  center?: boolean;
  wrap?: boolean;
  flex?: FlexValue;
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
}

/**
 * What Text and Heading take, and what a component that hands its props on
 * to one types them with (`(props: TextProps) => <Text {...props} />`, the
 * MDX components pattern): the typography props below, `children`,
 * `className`, `style`, the colour and alignment props, `LeafProps`,
 * `opacity` and the element's HTML attributes. Text and Heading themselves
 * type the attributes by `as` (`<Text as="a" href>`); padding, gap and the
 * rest of the layout props stay on a Column around the text.
 */
export interface TextProps<T extends ElementType = "span">
  extends CommonProps,
    LeafProps,
    Pick<DisplayProps, "opacity">,
    Omit<HTMLAttributes<HTMLElement>, keyof CommonProps | keyof LeafProps | "color"> {
  as?: T;
  /**
   * The typography preset, `${family}-${weight}-${size}` (`"body-default-m"`):
   * family, weight and size in one value. The same name as on Flex; 2.x called
   * it `variant` on Text and Heading, and also took `size` apart.
   */
  textVariant?: TextVariant;
  wrap?: CSSProperties["textWrap"];
  /**
   * Swap the font family and keep the preset's size and weight:
   * `textVariant="display-strong-m" family="code"`.
   */
  family?: TextType;
  /**
   * Swap the weight and keep the rest: the preset's family and size beside a
   * `textVariant`, or the surrounding text's without one, for an inline
   * emphasis such as `<Text weight="strong">` inside a sentence.
   */
  weight?: TextWeight;
  truncate?: boolean;
  /**
   * Hide from this breakpoint down: `s={{ hide: true }}`. Text takes only
   * `hide` here; anything else that changes at a breakpoint goes on a Row or
   * Column wrapper.
   */
  xl?: TextBreakpointHide;
  l?: TextBreakpointHide;
  m?: TextBreakpointHide;
  s?: TextBreakpointHide;
  xs?: TextBreakpointHide;
}

export interface TextBreakpointHide {
  hide?: boolean;
}

/**
 * The elements a component built on Text or Heading (CountFx, TypeFx,
 * ShineFx, ListItem) can render as. Text and Heading themselves take any
 * element, typed by it; a component that spreads its props onto one keeps to
 * the elements whose attributes are a span's.
 */
export type TextElement =
  | "span"
  | "p"
  | "div"
  | "label"
  | "li"
  | "strong"
  | "em"
  | "small"
  | "code"
  | "time"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

export interface SizeProps {
  /**
   * A number is on the token scale: `n` is what the token `"n"` is, n/16 rem
   * times `[data-scaling]` (`320` is 20rem, 320px at the default root size).
   * A string is a spacing token (`"16"` is `--static-space-16`), a t-shirt
   * size, or a CSS length (`"320px"`, `"50%"`, `"100dvh"`, `calc(…)`). Write
   * px for a length that must not scale. `"auto"` undoes a width, e.g.
   * `width={320} s={{ width: "auto" }}`; `"fit"` is fit-content, like `fitWidth`.
   */
  width?: number | SpacingToken | CSSUnit | "auto" | "fit";
  /**
   * As `width`; `"fit"` is fit-content, like `fitHeight`.
   * `"below-header"` is the viewport below the app header,
   * `calc(100dvh - var(--header-height))`, for an app shell's scrolling pane.
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

/**
 * Spacing and offsets. A spacing token (`"16"`, `"m"`) is a class; a number is
 * px and a CSS length (`"1.5rem"`) is written inline. `top={2}` is 2px, while
 * `top="2"` is the 0.125rem token.
 */
export interface SpacingProps {
  padding?: SpacingToken | number | CSSUnit;
  paddingLeft?: SpacingToken | number | CSSUnit;
  paddingRight?: SpacingToken | number | CSSUnit;
  paddingTop?: SpacingToken | number | CSSUnit;
  paddingBottom?: SpacingToken | number | CSSUnit;
  paddingX?: SpacingToken | number | CSSUnit;
  paddingY?: SpacingToken | number | CSSUnit;
  /**
   * Margins also take `"auto"`, as a class: `marginLeft="auto"` pushes an
   * item to the end of a row, `marginX="auto"` centres a block.
   */
  margin?: SpacingToken | number | CSSUnit | "auto";
  marginLeft?: SpacingToken | number | CSSUnit | "auto";
  marginRight?: SpacingToken | number | CSSUnit | "auto";
  marginTop?: SpacingToken | number | CSSUnit | "auto";
  marginBottom?: SpacingToken | number | CSSUnit | "auto";
  marginX?: SpacingToken | number | CSSUnit | "auto";
  marginY?: SpacingToken | number | CSSUnit | "auto";
  gap?: SpacingToken | number | CSSUnit | "-1";
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
export interface StyleProps {
  /** The typography preset for the text inside, `${family}-${weight}-${size}`. */
  textVariant?: TextVariant;
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
   * is on the token scale and a CSS length (`"1rem"`) is as written, inline by the server. It
   * sets the whole `filter`, so combine it with other filter functions in
   * `style` instead.
   */
  blur?: BlurSize | number | CSSUnit;
  /**
   * `backdrop-filter: blur()` — frosts what shows through a translucent
   * background. Same scale as `blur`; a number is on the token scale. Wins over the backdrop
   * blur `background="surface"` brings with a translucent theme.
   */
  backdropBlur?: BlurSize | number | CSSUnit;
  /**
   * Render this subtree in the light or dark theme, whatever the page is in:
   * `data-theme` on this element, typed. Not the same as `showIn`, which
   * shows or hides an element depending on the theme around it and changes
   * nothing about its colours.
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

export interface DisplayProps {
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
   * Show this element only while the theme around it is dark, or only while
   * it is light: one Logo for each, a screenshot per theme. It changes nothing
   * about the element's colours; to render a subtree dark, use `theme="dark"`.
   * 2.x spelled it as the `dark` and `light` booleans.
   */
  showIn?: "dark" | "light";
}

export interface CommonProps {
  onBackground?: Colors;
  onSolid?: Colors;
  align?: CSSProperties["textAlign"];
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

/**
 * Everything `Flex`, `Row` and `Column` read, apart from the attributes of the
 * element they render.
 */
export interface FlexLayoutProps
  extends FlexProps,
    StyleProps,
    SpacingProps,
    SizeProps,
    CommonProps,
    DisplayProps {}

/**
 * The props every leaf component takes besides its own: Button, IconButton,
 * ToggleButton, the fields (Input, Textarea, Select, NumberInput, ColorInput,
 * DateInput, TagInput, OTPInput, Slider), Switch, Checkbox, RadioButton,
 * Text, Heading, Icon, Avatar, Spinner, StatusIndicator, Kbd, InlineCode,
 * ProgressBar, Logo, SmartLink and NavIcon.
 *
 * They place the element among its siblings and nothing more. Padding,
 * background, border, radius, sizes and the `xl`…`xs` breakpoint objects
 * belong to the layout components (Flex, Row, Column, Grid, Card…): to change
 * one of those on a leaf, or anything at a breakpoint, wrap it,
 * `<Row s={{ hide: true }}><Button … /></Row>`.
 *
 * `id`, `data-*` and `aria-*` are the element's own attributes, as are its
 * events.
 */
export interface LeafProps {
  /**
   * A spacing token (`"16"`) is a class, a number is the same length inline, a CSS length is
   * inline; `"auto"` pushes the element along its row.
   */
  margin?: SpacingToken | number | CSSUnit | "auto";
  marginTop?: SpacingToken | number | CSSUnit | "auto";
  marginRight?: SpacingToken | number | CSSUnit | "auto";
  marginBottom?: SpacingToken | number | CSSUnit | "auto";
  marginLeft?: SpacingToken | number | CSSUnit | "auto";
  marginX?: SpacingToken | number | CSSUnit | "auto";
  marginY?: SpacingToken | number | CSSUnit | "auto";
  /** `flex` on the element, as a flex item: `flex={1}` takes the room left. */
  flex?: FlexValue;
  /** Stretch to the width of the parent. */
  fillWidth?: boolean;
  /** With `top`/`right`/`bottom`/`left`: a badge pinned to a corner. */
  position?: CSSProperties["position"];
  top?: SpacingToken | number | CSSUnit;
  right?: SpacingToken | number | CSSUnit;
  bottom?: SpacingToken | number | CSSUnit;
  left?: SpacingToken | number | CSSUnit;
  className?: string;
  style?: CSSProperties;
}

/** The names of `LeafProps`, for components that take them apart. */
export type LeafPropName = keyof LeafProps;

/**
 * A leaf's props on the element it renders: `LeafProps` and that element's
 * attributes (with `ref`), the layout props left out.
 */
export type LeafPropsOf<E extends ElementType> = LeafProps &
  Omit<ComponentPropsWithRef<E>, keyof LeafProps>;

/** Everything `Grid` reads, apart from the attributes of the element it renders. */
export interface GridLayoutProps
  extends GridProps,
    StyleProps,
    SpacingProps,
    SizeProps,
    CommonProps,
    DisplayProps {}

/**
 * A component's own props on the element `as` names: `as="a"` takes `href`,
 * `as="form"` types `onSubmit` with `HTMLFormElement`, `as="ul"` types the
 * ref as `HTMLUListElement`. A component (`as={Link}`) brings its own props.
 * Where an element attribute shares a name with an own prop (`width`, `wrap`),
 * the own prop wins.
 */
export type PolymorphicProps<T extends ElementType, Own> = Own & {
  /** The element (or component) to render, in place of the default one. */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof Own | "as">;

/**
 * `Flex`'s props on its default `div`, without `as`: what a component built on
 * Flex, Row or Column takes and spreads onto it.
 */
export type FlexElementProps = FlexPropsOf<"div">;

/**
 * `Flex`'s props on one element, without `as`: for a component that always
 * renders `<Flex as="blockquote">` and takes that element's attributes.
 */
export type FlexPropsOf<E extends ElementType> = FlexLayoutProps &
  Omit<ComponentPropsWithRef<E>, keyof FlexLayoutProps>;

/** `Grid`'s props on its default `div`, without `as`. */
export type GridElementProps = GridLayoutProps &
  Omit<ComponentPropsWithRef<"div">, keyof GridLayoutProps>;

/**
 * The call signatures of a polymorphic layout primitive. The generic one is
 * what JSX resolves; the last, non-generic one is what
 * `React.ComponentProps<typeof Flex>` reads, so a component that extends it
 * gets the `div` props rather than `any`.
 */
export interface PolymorphicComponent<Own, Default extends ElementType> {
  <T extends ElementType = Default>(props: PolymorphicProps<T, Own>): ReactNode;
  (props: Own & Omit<ComponentPropsWithRef<Default>, keyof Own>): ReactNode;
  displayName?: string;
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
// ============================================================================

// Union of all prop interfaces available to Flex-derived components
type AllFlexProps = FlexProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

// Union of all prop interfaces available to Grid-derived components
type AllGridProps = GridProps & StyleProps & SpacingProps & SizeProps & CommonProps & DisplayProps;

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
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
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
  // Effects / state
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "transition"
  | "scrollbar"
  // Display / position
  | "position"
  | "hide"
  | "overflow"
  | "overflowX"
  | "overflowY"
  // Escape hatch
  | "style"
>;
