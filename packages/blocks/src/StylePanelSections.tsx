"use client";

import {
  Accordion,
  type BodyLineHeight,
  type BodySize,
  type BorderStyle,
  Button,
  type DataStyle as ChartMode,
  ColorButton,
  Column,
  type Density,
  Flex,
  Grid,
  type GridSize,
  Icon,
  IconButton,
  Line,
  type NeutralColor,
  type ScalingSize,
  type Schemes,
  Scroller,
  type ScrollerLabels,
  SegmentedControl,
  type SegmentedControlProps,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  schemes,
  Text,
  type Theme,
  ThemeSwitcher,
  type ThemeSwitcherLabels,
  type TransitionStyle,
  useDataTheme,
  useStyle,
} from "@once-ui-system/core";
import classNames from "clsx";
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "./internal/labels.js";
import { radioGroupKeyDown } from "./internal/radioKeys.js";
import { revealInStrip } from "./internal/revealInStrip.js";
import styles from "./StylePanel.module.scss";

/** Every style choice the panel can edit, including the chart mode, which is
 *  owned by DataThemeProvider rather than ThemeProvider. */
export interface StylePanelValue {
  theme?: Theme;
  border?: BorderStyle;
  brand?: Schemes | "custom";
  accent?: Schemes | "custom";
  neutral?: NeutralColor | "custom";
  solid?: SolidType;
  solidStyle?: SolidStyle;
  surface?: SurfaceStyle;
  scaling?: ScalingSize;
  /**
   * The controls' default size, `"compact"` / `"normal"` / `"spacious"`.
   * Bound to ThemeProvider, a new density also brings its scaling (95, 100
   * or 105) unless a scaling was chosen; a host that owns the state passes
   * both to the providers, which do the same.
   */
  density?: Density;
  transition?: TransitionStyle;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
  chartMode?: ChartMode;
  /**
   * The colour `brand: "custom"` is generated from — hex, `rgb()` or
   * `oklch()`, named as on ThemeProvider. Edited by the Brand row's custom
   * swatch (`custom`). The panel only reports it: the host renders the
   * scheme, with `ThemeInit`/`ThemeProvider`'s `brandSeed` or
   * `customSchemeProperties`.
   */
  brandSeed?: string;
  /** As `brandSeed`, for `accent: "custom"` and the Accent row. */
  accentSeed?: string;
  /** As `brandSeed`, for `neutral: "custom"` and the Neutral row. */
  neutralSeed?: string;
}

/** Per-section and per-row visibility. Omitted keys default to visible. */
export interface StylePanelVisibility {
  page?: { section?: boolean; theme?: boolean; shape?: boolean };
  color?: { section?: boolean; brand?: boolean; accent?: boolean; neutral?: boolean };
  solidStyle?: { section?: boolean; solid?: boolean; effect?: boolean };
  bodyText?: { section?: boolean; size?: boolean; lineHeight?: boolean };
  advanced?: {
    section?: boolean;
    surface?: boolean;
    density?: boolean;
    scaling?: boolean;
    dataStyle?: boolean;
    transition?: boolean;
  };
}

/** `label={false}` drops the row's label; any node replaces it. */
export interface StyleRowProps extends Omit<React.ComponentProps<typeof Flex>, "label"> {
  label?: ReactNode | false;
  /**
   * What the row does, shown in a tooltip on an info icon beside the label.
   * A built-in row takes its English default from `labels.hints` while the
   * Root's `hints` is on; `false` drops it.
   */
  hint?: ReactNode | false;
}

/** Brand, Accent and Neutral take one more prop than the other rows. */
export interface StyleSchemeRowProps extends StyleRowProps {
  /**
   * End the swatches with one for a colour of the host's own, painted with
   * the current seed, and edit the seed in a colour field while it is
   * chosen. Choosing it reports `{ brand: "custom", brandSeed }` (or the
   * accent or neutral pair) through `onValueChange`.
   *
   * Controlled mode only. Bound to ThemeProvider, whose `setStyle` takes no
   * seed, the panel has nowhere to put one, so the swatch does not render.
   */
  custom?: boolean;
  /**
   * `"wrap"` lays every swatch out in rows that wrap, under the label,
   * instead of one strip that scrolls. Defaults to the Root's `swatches`.
   */
  swatches?: StylePanelSwatchLayout;
}

export interface StyleGroupProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  title?: ReactNode | false;
  description?: ReactNode | false;
}

/* ---- labels -------------------------------------------------------------- */

/** The two colour rows, Brand and Accent. */
export type StylePanelSchemeRow = "brand" | "accent";

/**
 * Which colour rows offer a custom colour. `true` is Brand and Accent, as it
 * was before Neutral could; list the rows to include Neutral.
 */
export type StylePanelCustomColors = boolean | readonly (StylePanelSchemeRow | "neutral")[];

/** A group's heading. */
export interface StylePanelHeading {
  title?: ReactNode;
  description?: ReactNode;
}

/** Each group's heading, keyed like `visibility`. */
export interface StylePanelGroupLabels {
  /** Defaults to "Page" and "Customize page theme". */
  page?: StylePanelHeading;
  /** Defaults to "Color" and "Customize color schemes". */
  color?: StylePanelHeading;
  /** Defaults to "Solid style" and "Customize the appearance of interactive elements". */
  solidStyle?: StylePanelHeading;
  /** Defaults to "Body text" and "Scale running text without touching headings". */
  bodyText?: StylePanelHeading;
  /** Defaults to "Advanced" and "Customize advanced styling options". */
  advanced?: StylePanelHeading;
  /** `StylePanelSite`'s first section. Defaults to "Look", no description. */
  look?: StylePanelHeading;
  /** `StylePanelSite`'s shape and buttons section. Defaults to "Shape and buttons". */
  shape?: StylePanelHeading;
  /** `StylePanelSite`'s fonts section. Defaults to "Fonts". */
  fonts?: StylePanelHeading;
  /** `StylePanelSite`'s folded section. Defaults to "Fine-tune". */
  fineTune?: StylePanelHeading;
}

/** Each row's label, keyed by the row's part name (`StylePanelBodySize` → `bodySize`). */
export interface StylePanelRowLabels {
  /** Defaults to `"Theme"`. */
  theme?: ReactNode;
  /** Defaults to `"Shape"`. */
  shape?: ReactNode;
  /** Defaults to `"Brand"`. */
  brand?: ReactNode;
  /** Defaults to `"Accent"`. */
  accent?: ReactNode;
  /** Defaults to `"Neutral"`. */
  neutral?: ReactNode;
  /** Defaults to `"Style"`. */
  solid?: ReactNode;
  /** Defaults to `"Effect"`. */
  effect?: ReactNode;
  /** Defaults to `"Surface"`. */
  surface?: ReactNode;
  /** Defaults to `"Density"`. */
  density?: ReactNode;
  /** Defaults to `"Scaling"`. */
  scaling?: ReactNode;
  /** Defaults to `"Transition"`. */
  transition?: ReactNode;
  /** Defaults to `"Data Style"`. */
  dataStyle?: ReactNode;
  /** Defaults to `"Text size"`. */
  bodySize?: ReactNode;
  /** Defaults to `"Line height"`. */
  bodyLineHeight?: ReactNode;
  /** Defaults to `"Fonts"`. */
  fonts?: ReactNode;
}

/** The segmented rows' option labels, keyed by row and then by value. */
export interface StylePanelOptionLabels {
  /** Defaults to Color, Inverse and Contrast. */
  solid?: Partial<Record<SolidType, ReactNode>>;
  /** Defaults to Flat and Plastic. */
  effect?: Partial<Record<SolidStyle, ReactNode>>;
  /** Defaults to Filled and Translucent. */
  surface?: Partial<Record<SurfaceStyle, ReactNode>>;
  /** Defaults to All, Micro, Macro and None. */
  transition?: Partial<Record<TransitionStyle, ReactNode>>;
  /** Defaults to Categorical, Divergent and Sequential. */
  dataStyle?: Partial<Record<ChartMode, ReactNode>>;
  /** Defaults to Compact, Normal and Spacious. */
  density?: Partial<Record<Density, ReactNode>>;
  /** Formats a scaling option, `"90"` to `"110"`. Defaults to the value as written. */
  scaling?: (value: ScalingSize) => ReactNode;
  /**
   * The words for scaling steps on a `named` Scaling row. Defaults to
   * Smallest, Small, Normal, Large and Largest for 90 to 110.
   */
  scalingNames?: Partial<Record<ScalingSize, ReactNode>>;
  /** Formats a text size option, `"90"` to `"110"`. Defaults to the value as written. */
  bodySize?: (value: BodySize) => ReactNode;
  /** Formats a line height option, `"90"` to `"120"`. Defaults to the value as written. */
  bodyLineHeight?: (value: BodyLineHeight) => ReactNode;
}

/** Display names for the swatch rows' values, which their accessible names are built from. */
export interface StylePanelNameLabels {
  /** Defaults to the key: `"sharp"`, `"conservative"`, `"playful"`, `"rounded"`. */
  shapes?: Partial<Record<BorderStyle, string>>;
  /** Defaults to the key: `"blue"`, `"indigo"` and the rest. */
  schemes?: Partial<Record<Schemes, string>>;
  /** Defaults to the key: `"gray"`, `"sand"` and the rest. */
  neutrals?: Partial<Record<NeutralColor, string>>;
}

/**
 * The swatches' accessible names. Functions, so a translation can put the
 * words in its own order; `name` is the display name from `names`.
 */
export interface StylePanelSwatchLabels {
  /** Defaults to `` (name) => `Corner style: ${name}` ``. */
  shape?: (name: string) => string;
  /** Defaults to `` (name, row) => `Brand colour: ${name}` ``, or `Accent colour` on the accent row. */
  scheme?: (name: string, row: StylePanelSchemeRow) => string;
  /** Defaults to `` (name) => `Neutral colour: ${name}` ``. */
  neutral?: (name: string) => string;
}

/** The custom colour on the Neutral row (`custom`). */
export interface StylePanelNeutralCustomLabels {
  /** The custom swatch's accessible name. Defaults to `Neutral colour: custom`. */
  swatch?: string;
  /** The colour field's label. Defaults to `Custom neutral colour`. */
  picker?: string;
  /** Text under the colour field, from the current seed. None by default. */
  description?: (seed: string) => ReactNode;
}

/** The custom colour on the Brand, Accent and Neutral rows (`custom`). */
export interface StylePanelCustomLabels {
  /** The custom swatch's accessible name. Defaults to `Brand colour: custom` (`Accent colour: custom`). */
  swatch?: (row: StylePanelSchemeRow) => string;
  /** The colour button's text and accessible name. Defaults to `Custom brand colour` (`Custom accent colour`). */
  picker?: (row: StylePanelSchemeRow) => string;
  /** Text under the colour field, from the current seed: a contrast hint, say. None by default. */
  description?: (seed: string, row: StylePanelSchemeRow) => ReactNode;
  /**
   * @deprecated Since 3.1 the custom colour is a ColorButton, which has no
   * clear button; the value is ignored.
   */
  remove?: string;
  /** The Neutral row's own words: kept apart so `row` above stays `"brand" | "accent"`. */
  neutral?: StylePanelNeutralCustomLabels;
}

/**
 * Every string the panel shows or announces, for a translated interface.
 *
 * Every field at every depth is optional: what is left out keeps its English
 * default, so a host can translate one group at a time. A row's `label` or a
 * group's `title`/`description` passed as a prop still wins over these.
 */
export interface StylePanelLabels {
  groups?: StylePanelGroupLabels;
  rows?: StylePanelRowLabels;
  options?: StylePanelOptionLabels;
  names?: StylePanelNameLabels;
  swatches?: StylePanelSwatchLabels;
  /** The Theme row's options, passed to its `ThemeSwitcher`. */
  themeSwitcher?: ThemeSwitcherLabels;
  /** The scroll buttons of the colour swatch strips, passed to their `Scroller`. */
  scroller?: ScrollerLabels;
  custom?: StylePanelCustomLabels;
  /** Each built-in row's tooltip, shown while the Root's `hints` is on. */
  hints?: StylePanelRowLabels;
  /** Words on option tiles (`tiles`). */
  tiles?: StylePanelTileLabels;
  /** The Fonts row (`StylePanelFonts`). */
  fonts?: StylePanelFontLabels;
}

/** Words on option tiles. */
export interface StylePanelTileLabels {
  /** The text on each tile's sample button. Defaults to `"Button"`. */
  sample?: string;
}

/** The Fonts row's own words. */
export interface StylePanelFontLabels {
  /** The toggle that shows the row's `more` content. Defaults to `"One by one"`. */
  more?: ReactNode;
  /** The text each pairing is drawn in. Defaults to `"Aa"`. */
  sample?: string;
}

/** A labels type with every field filled in, at every depth. */
type Complete<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (...args: never[]) => unknown
    ? NonNullable<T[K]>
    : NonNullable<T[K]> extends object
      ? Complete<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};

/**
 * What is passed straight through stays partial: the theme switcher, the
 * scroller and the colour field keep their own English defaults, so they live
 * in one place.
 * The custom colour has no description unless the host gives one.
 */
type ResolvedLabels = Complete<Omit<StylePanelLabels, "themeSwitcher" | "scroller" | "custom">> & {
  themeSwitcher: ThemeSwitcherLabels;
  scroller: ScrollerLabels;
  custom: Complete<Pick<StylePanelCustomLabels, "swatch" | "picker">> &
    Pick<StylePanelCustomLabels, "description" | "remove"> & {
      neutral: Complete<Pick<StylePanelNeutralCustomLabels, "swatch" | "picker">> &
        Pick<StylePanelNeutralCustomLabels, "description">;
    };
};

const shapes = ["sharp", "conservative", "playful", "rounded"] as const;
const neutrals = ["gray", "sand", "slate", "dusk", "mint", "rose"] as const;
const scalingSizes: ScalingSize[] = ["90", "95", "100", "105", "110"];
const bodySizes: BodySize[] = ["90", "95", "100", "105", "110"];
const bodyLineHeights: BodyLineHeight[] = ["90", "100", "110", "120"];

const keysAsNames = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((key): [K, string] => [key, key])) as Record<K, string>;

const DEFAULT_LABELS: ResolvedLabels = {
  groups: {
    page: { title: "Page", description: "Customize page theme" },
    color: { title: "Color", description: "Customize color schemes" },
    solidStyle: {
      title: "Solid style",
      description: "Customize the appearance of interactive elements",
    },
    bodyText: { title: "Body text", description: "Scale running text without touching headings" },
    advanced: { title: "Advanced", description: "Customize advanced styling options" },
    look: { title: "Look", description: "" },
    shape: { title: "Shape and buttons", description: "" },
    fonts: { title: "Fonts", description: "" },
    fineTune: { title: "Fine-tune", description: "" },
  },
  rows: {
    theme: "Theme",
    shape: "Shape",
    brand: "Brand",
    accent: "Accent",
    neutral: "Neutral",
    solid: "Style",
    effect: "Effect",
    surface: "Surface",
    density: "Density",
    scaling: "Scaling",
    transition: "Transition",
    dataStyle: "Data Style",
    bodySize: "Text size",
    bodyLineHeight: "Line height",
    fonts: "Fonts",
  },
  options: {
    solid: { color: "Color", inverse: "Inverse", contrast: "Contrast" },
    effect: { flat: "Flat", plastic: "Plastic", glow: "Glow" },
    surface: { filled: "Filled", translucent: "Translucent" },
    transition: { all: "All", micro: "Micro", macro: "Macro", none: "None" },
    dataStyle: { categorical: "Categorical", divergent: "Divergent", sequential: "Sequential" },
    density: { compact: "Compact", normal: "Normal", spacious: "Spacious" },
    scaling: (value) => value,
    scalingNames: {
      "90": "Smallest",
      "95": "Small",
      "100": "Normal",
      "105": "Large",
      "110": "Largest",
    },
    bodySize: (value) => value,
    bodyLineHeight: (value) => value,
  },
  names: {
    shapes: keysAsNames(shapes),
    schemes: keysAsNames(schemes as Schemes[]),
    neutrals: keysAsNames(neutrals),
  },
  swatches: {
    shape: (name) => `Corner style: ${name}`,
    scheme: (name, row) => `${row === "brand" ? "Brand" : "Accent"} colour: ${name}`,
    neutral: (name) => `Neutral colour: ${name}`,
  },
  themeSwitcher: {},
  scroller: {},
  tiles: { sample: "Button" },
  fonts: { more: "One by one", sample: "Aa" },
  custom: {
    swatch: (row) => `${row === "brand" ? "Brand" : "Accent"} colour: custom`,
    picker: (row) => `Custom ${row} colour`,
    neutral: { swatch: "Neutral colour: custom", picker: "Custom neutral colour" },
  },
  hints: {
    theme: "Light, dark, or the visitor's own system setting.",
    shape: "How round buttons, cards and inputs are.",
    brand: "The main colour: buttons, links and highlights.",
    accent: "A second colour for small touches such as badges.",
    neutral: "The tint in the greys of text, borders and backgrounds.",
    solid: "What fills a solid button: the colour, its inverse or high contrast.",
    effect: "The finish of solid buttons: flat, plastic or glow.",
    surface: "Filled surfaces, or translucent ones that blur what is behind.",
    density: "How much room controls and lists take.",
    scaling: "Makes all text and spacing a little smaller or larger.",
    transition: "Which animations play.",
    dataStyle: "How charts colour their series.",
    bodySize: "The size of running text; headings keep theirs.",
    bodyLineHeight: "The space between lines of running text.",
    fonts: "The typefaces for headings and running text.",
  },
};

/**
 * The merged labels. Its default is the English set rather than nothing, so
 * a row rendered outside a Root — `StylePanelTheme` needs no state — still
 * has its text.
 */
const StylePanelLabelsContext = createContext<ResolvedLabels>(DEFAULT_LABELS);

const useStylePanelLabels = () => useContext(StylePanelLabelsContext);

/** A row label's width, in any unit Flex takes. */
export type StylePanelLabelWidth = Exclude<
  React.ComponentProps<typeof Flex>["width"],
  "auto" | "fit"
>;

/** Row labels' shared width beside their control, and whether built-in hints show. */
const StylePanelRowLayoutContext = createContext<{
  labelWidth?: StylePanelLabelWidth;
  hints: boolean;
}>({
  hints: false,
});

/** Whether rows put their label above their control. False outside a Root. */
const StylePanelStackedContext = createContext(false);

/** How much room the panel's rows and groups take: `m` (default) or the tighter `s`. */
export type StylePanelSize = "s" | "m";

/** The panel's size, for rows and groups. `m` outside a Root. */
const StylePanelSizeContext = createContext<StylePanelSize>("m");

/** How a colour row lays out its swatches: one strip that scrolls, or rows that wrap. */
export type StylePanelSwatchLayout = "scroll" | "wrap";

/**
 * The Root's choices for every row inside: whether Shape, Solid and Effect
 * draw their options as tiles, and how colour rows lay out their swatches.
 */
const StylePanelDisplayContext = createContext<{
  tiles: boolean;
  swatches: StylePanelSwatchLayout;
}>({ tiles: false, swatches: "scroll" });

/**
 * True inside a `StylePanelSection`: rows there sit flush, with no padding
 * of their own, label above control, as fields in a form.
 */
const StylePanelFlushContext = createContext(false);

/** How a row lays its label against its control: beside it, or above it. */
const INLINE_LINE = { horizontal: "between", vertical: "center", gap: "24" } as const;
const STACKED_LINE = {
  direction: "column",
  horizontal: "start",
  vertical: "start",
  gap: "12",
} as const;

/** Each size's spacing: a row's padding and gaps, a group's gaps. */
const SPACING = {
  m: {
    rowX: "24",
    stackedRowX: "16",
    rowY: "16",
    inlineGap: "24",
    stackedGap: "12",
    groupGap: "16",
    headingTop: "12",
    headingLeft: "16",
  },
  s: {
    rowX: "16",
    stackedRowX: "12",
    rowY: "8",
    inlineGap: "16",
    stackedGap: "8",
    groupGap: "8",
    headingTop: "4",
    headingLeft: "12",
  },
} as const;

/**
 * The id of the row's visible label, which names the row's option group. Null
 * when the row shows no label (`label={false}`): the group then falls back to
 * the row's default label, when that is a string.
 */
const StyleRowLabelContext = createContext<string | null>(null);

/** The props that name a row's option group: its visible label, else `fallback`. */
function useGroupName(fallback: ReactNode) {
  const labelId = useContext(StyleRowLabelContext);
  if (labelId) return { "aria-labelledby": labelId };
  return typeof fallback === "string" ? { "aria-label": fallback } : {};
}

/** A prop the caller set — including `false` or `null` — wins over the label. */
const prefer = <T,>(prop: T | undefined, label: T): T => (prop === undefined ? label : prop);

/* ---- state --------------------------------------------------------------- */

interface StylePanelContextValue {
  value: StylePanelValue;
  set: (patch: Partial<StylePanelValue>) => void;
  /** False until after hydration, so a stored choice cannot mismatch the server render. */
  mounted: boolean;
  /** True when a host owns the state; the panel then never writes to the providers. */
  controlled: boolean;
}

const StylePanelContext = createContext<StylePanelContextValue | null>(null);

function useStylePanel(): StylePanelContextValue {
  const context = useContext(StylePanelContext);
  if (!context) {
    throw new Error(
      "StylePanel sections must be rendered inside a <StylePanel> or <StylePanelRoot>",
    );
  }
  return context;
}

/** Reads and writes ThemeProvider — the default when no `value` is given. */
function useBoundState(): Omit<StylePanelContextValue, "controlled"> {
  const styleContext = useStyle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const value = useMemo<StylePanelValue>(
    () => ({
      theme: styleContext.theme,
      border: styleContext.border,
      brand: styleContext.brand,
      accent: styleContext.accent,
      neutral: styleContext.neutral,
      solid: styleContext.solid,
      solidStyle: styleContext.solidStyle,
      surface: styleContext.surface,
      scaling: styleContext.scaling,
      density: styleContext.density,
      transition: styleContext.transition,
      bodySize: styleContext.bodySize,
      bodyLineHeight: styleContext.bodyLineHeight,
    }),
    [styleContext],
  );

  const set = useCallback(
    (patch: Partial<StylePanelValue>) => {
      // chartMode lives in DataThemeProvider; the DataStyle row handles it.
      const { chartMode: _chartMode, ...style } = patch;
      if (Object.keys(style).length > 0) styleContext.setStyle(style);
    },
    [styleContext],
  );

  return { value, set, mounted };
}

export interface StylePanelRootProps
  extends Omit<React.ComponentProps<typeof Column>, "value" | "onChange"> {
  /** Set it to take ownership of the state (pair with `onValueChange`). The
   *  panel then writes nothing to ThemeProvider, DataThemeProvider or storage. */
  value?: StylePanelValue;
  /** Called with the whole next value and the part that changed. */
  onValueChange?: (next: StylePanelValue, changed: Partial<StylePanelValue>) => void;
  /** Every string the panel shows or announces, over the English defaults.
   *  Every group and row inside reads them; their own props still win. */
  labels?: StylePanelLabels;
  /** Put each row's label above its control, for a narrow sidebar. A row's
   *  own layout props still win. */
  stacked?: boolean;
  /** How much room rows and groups take: `m` (default), or `s` for a denser panel. */
  size?: StylePanelSize;
  /**
   * One width for every row's label beside its control (`"8rem"`), so the
   * controls line up and a long label never breaks. Ignored while `stacked`.
   */
  labelWidth?: StylePanelLabelWidth;
  /** Show each built-in row's tooltip from `labels.hints`. A row's own `hint` still wins. */
  hints?: boolean;
  /**
   * Draw the Shape, Solid and Effect rows' options as tiles: a real button
   * per option, wearing that option, with its name under it. Every option
   * stays on screen in a narrow panel, where the segmented control would
   * scroll. A row's own `tiles` still wins.
   */
  tiles?: boolean;
  /**
   * How the colour rows lay out their swatches: `"scroll"` (default), one
   * strip with scroll buttons, or `"wrap"`, every swatch on screen in rows
   * that wrap. A row's own `swatches` still wins.
   */
  swatches?: StylePanelSwatchLayout;
}

const Root = function Root({
  ref,
  value,
  onValueChange,
  labels,
  stacked = false,
  size = "m",
  labelWidth,
  hints = false,
  tiles = false,
  swatches = "scroll",
  children,
  ...rest
}: StylePanelRootProps) {
  const bound = useBoundState();
  // Controlled when `value` is set, whether or not a handler is passed.
  const controlled = value !== undefined;

  const controlledSet = useCallback(
    (patch: Partial<StylePanelValue>) => onValueChange?.({ ...value, ...patch }, patch),
    [value, onValueChange],
  );

  const context = useMemo<StylePanelContextValue>(
    () =>
      controlled
        ? { value: value ?? {}, set: controlledSet, mounted: true, controlled: true }
        : { ...bound, controlled: false },
    [controlled, value, controlledSet, bound],
  );

  const resolvedLabels = useMemo(() => mergeLabels(DEFAULT_LABELS, labels), [labels]);
  const rowLayout = useMemo(() => ({ labelWidth, hints }), [labelWidth, hints]);
  const display = useMemo(() => ({ tiles, swatches }), [tiles, swatches]);

  return (
    <StylePanelContext.Provider value={context}>
      <StylePanelLabelsContext.Provider value={resolvedLabels}>
        <StylePanelStackedContext.Provider value={stacked}>
          <StylePanelSizeContext.Provider value={size}>
            <StylePanelRowLayoutContext.Provider value={rowLayout}>
              <StylePanelDisplayContext.Provider value={display}>
                <Column fillWidth gap={SPACING[size].groupGap} ref={ref} {...rest}>
                  {children}
                </Column>
              </StylePanelDisplayContext.Provider>
            </StylePanelRowLayoutContext.Provider>
          </StylePanelSizeContext.Provider>
        </StylePanelStackedContext.Provider>
      </StylePanelLabelsContext.Provider>
    </StylePanelContext.Provider>
  );
};

/* ---- primitives ---------------------------------------------------------- */

function RowLabel({
  id,
  children,
  hint,
  above = false,
}: {
  id?: string;
  children: ReactNode;
  hint?: ReactNode;
  above?: boolean;
}) {
  const stackedPanel = useContext(StylePanelStackedContext);
  const flush = useContext(StylePanelFlushContext);
  const stacked = stackedPanel || flush || above;
  const { labelWidth } = useContext(StylePanelRowLayoutContext);
  const fixed = !stacked && labelWidth !== undefined;
  return (
    <Flex
      id={id}
      textVariant="label-default-s"
      onBackground="neutral-strong"
      vertical={hint || fixed ? "center" : undefined}
      gap={hint ? "4" : undefined}
      minWidth={fixed ? labelWidth : "3rem"}
      width={fixed ? labelWidth : undefined}
      style={fixed ? { flexShrink: 0 } : undefined}
    >
      {fixed ? (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
        >
          {children}
        </span>
      ) : (
        children
      )}
      {hint && (
        <Icon
          name="info"
          size="xs"
          onBackground="neutral-weak"
          tooltip={hint}
          tooltipPosition="top"
          style={{ flexShrink: 0 }}
        />
      )}
    </Flex>
  );
}

/** A row's tooltip: its own `hint`, else the built-in one while the Root's `hints` is on. */
function useRowHint(hint: ReactNode | false | undefined, row?: keyof StylePanelRowLabels) {
  const { hints } = useContext(StylePanelRowLayoutContext);
  const labels = useStylePanelLabels();
  if (hint !== undefined) return hint || undefined;
  return hints && row ? labels.hints[row] : undefined;
}

/** One labelled row. Dividers come from the group's stylesheet rather than a
 *  prop, so cherry-picking rows never leaves a dangling border. A host's
 *  `className` joins the row's own rather than replacing it, which would
 *  drop the divider. */
function Row({
  label,
  hint,
  hintFor,
  above = false,
  children,
  className,
  ...rest
}: StyleRowProps & {
  /** Show this built-in row's hint from `labels.hints` while the Root's `hints` is on. */
  hintFor?: keyof StylePanelRowLabels;
  /** Put the label above the control whatever the panel's layout: a row of tiles needs the width. */
  above?: boolean;
}) {
  const flush = useContext(StylePanelFlushContext);
  const stackedPanel = useContext(StylePanelStackedContext);
  const stacked = stackedPanel || flush || above;
  const tip = useRowHint(hint, hintFor);
  const space = SPACING[useContext(StylePanelSizeContext)];
  const labelId = useId();
  return (
    <StyleRowLabelContext.Provider value={label !== false ? labelId : null}>
      <Flex
        className={classNames(styles.row, className)}
        fillWidth
        paddingX={flush ? "0" : stacked ? space.stackedRowX : space.rowX}
        paddingY={flush ? "0" : space.rowY}
        {...(stacked ? STACKED_LINE : INLINE_LINE)}
        gap={flush ? "8" : stacked ? space.stackedGap : space.inlineGap}
        {...rest}
      >
        {label !== false && (
          <RowLabel id={labelId} hint={tip} above={above}>
            {label}
          </RowLabel>
        )}
        {children}
      </Flex>
    </StyleRowLabelContext.Provider>
  );
}

function Group({ title, description, children, ...rest }: StyleGroupProps) {
  const space = SPACING[useContext(StylePanelSizeContext)];
  return (
    <Column fillWidth gap={space.groupGap} {...rest}>
      {(title !== false || description !== false) && (
        <Column fillWidth paddingTop={space.headingTop} paddingLeft={space.headingLeft} gap="4">
          {title !== false && (
            <Text textVariant="heading-strong-s" onBackground="neutral-strong">
              {title}
            </Text>
          )}
          {description !== false && (
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {description}
            </Text>
          )}
        </Column>
      )}
      <Column fillWidth border="neutral-alpha-medium" radius="l-4" className={styles.group}>
        {children}
      </Column>
    </Column>
  );
}

/** Enter and Space choose a swatch, as they would a native button. */
function activateOnKey(event: KeyboardEvent<HTMLElement>, activate: () => void) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  activate();
}

/** One swatch: a radio in its row's group, named and checked, with a decorative face. */
function Swatch({
  label,
  pressed,
  tabStop,
  onSelect,
  scroll,
  dataBorder,
  children,
}: {
  label: string;
  pressed: boolean;
  /** The group's one Tab stop: the chosen swatch, or the first while none is. */
  tabStop: boolean;
  onSelect: () => void;
  scroll?: boolean;
  dataBorder?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // In a strip that scrolls, the chosen swatch is brought into view when the
  // panel mounts and whenever the choice changes. The custom swatch is last,
  // so in a narrow panel it would otherwise start under the Next button. A
  // choice the visitor just made glides; one that arrived from outside jumps.
  useEffect(() => {
    const swatch = ref.current;
    if (!scroll || !pressed || !swatch) return;
    // The strip is the Scroller's scrolling row, which holds the radio group.
    revealInStrip(
      swatch,
      swatch.parentElement?.parentElement ?? null,
      document.activeElement === swatch,
    );
  }, [scroll, pressed]);

  return (
    <Flex
      ref={ref}
      {...(dataBorder ? { "data-border": dataBorder } : {})}
      marginRight={scroll ? "2" : undefined}
      center
      tabIndex={tabStop ? 0 : -1}
      role="radio"
      aria-label={label}
      aria-checked={pressed}
      className={classNames(styles.select, pressed ? styles.selected : "")}
      onClick={onSelect}
      onKeyDown={(event) => activateOnKey(event, onSelect)}
    >
      {/* Decorative: the parent Flex is the control. */}
      <IconButton variant="ghost" size="m" aria-hidden>
        {children}
      </IconButton>
    </Flex>
  );
}

function Swatches<T extends string>({
  options,
  selected,
  onSelect,
  ariaLabel,
  scroll,
  swatchClass,
  dataBorder,
  trailing,
  trailingChecked = false,
  scrollLabels,
  name,
  wrap = false,
}: {
  options: readonly T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  ariaLabel: (value: T) => string;
  /** The group's name when its row shows no label: the row's default label. */
  name: ReactNode;
  scroll?: boolean;
  /** The strip's scroll buttons, when `scroll` is set. */
  scrollLabels?: ScrollerLabels;
  swatchClass?: (value: T) => string;
  dataBorder?: boolean;
  /** One more swatch after the options, in the same strip. */
  trailing?: ReactNode;
  /** Whether `trailing` is the chosen swatch, which makes it the Tab stop. */
  trailingChecked?: boolean;
  /** Lay every swatch out in rows that wrap, instead of `scroll`'s one strip. */
  wrap?: boolean;
}) {
  const groupName = useGroupName(name);
  const checked =
    (trailing != null && trailingChecked) || options.some((option) => option === selected);
  const items = options.map((option, index) => (
    <Swatch
      key={option}
      label={ariaLabel(option)}
      pressed={selected === option}
      tabStop={checked ? selected === option : index === 0}
      onSelect={() => onSelect(option)}
      scroll={scroll && !wrap}
      dataBorder={dataBorder ? option : undefined}
    >
      <div
        className={classNames(swatchClass ? swatchClass(option) : styles.neutral, styles.swatch)}
      />
    </Swatch>
  ));

  // A radio group: one Tab stop, and the arrows move and choose. In a strip
  // that scrolls it is the row of swatches inside the Scroller rather than the
  // Scroller, which also holds the scroll buttons.
  const group = { role: "radiogroup", ...groupName, onKeyDown: radioGroupKeyDown } as const;

  if (wrap) {
    return (
      <Flex fillWidth wrap gap="4" {...group}>
        {items}
        {trailing}
      </Flex>
    );
  }

  return scroll ? (
    <Scroller minWidth={0} fitWidth className={styles.strip} labels={scrollLabels}>
      <Flex {...group} style={{ minWidth: "max-content" }}>
        {items}
        {trailing}
      </Flex>
    </Scroller>
  ) : (
    <Flex gap="4" {...group}>
      {items}
      {trailing}
    </Flex>
  );
}

/** Whether rows sit flush, inside a `StylePanelSection`. */
const useFlush = () => useContext(StylePanelFlushContext);

/** A shape's display name with a capital, for a tile's caption. */
const capitalise = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/** What a tile's sample wears: the option it stands for, over the current choices. */
interface TileSample {
  border?: BorderStyle;
  solid?: SolidType;
  solidStyle?: SolidStyle;
}

/**
 * A real Button dressed in the panel's current choices and then in the
 * option's own, as a picture inside its tile: the tile is the control, so the
 * button takes no focus and is hidden from assistive tech.
 */
function SampleButton({ sample }: { sample: TileSample }) {
  const { value, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  const current = mounted ? value : {};
  const brand = current.brand && current.brand !== "custom" ? current.brand : undefined;
  return (
    <Flex
      themeBorder={sample.border ?? current.border}
      themeSolid={sample.solid ?? current.solid}
      {...{ "data-solid-style": sample.solidStyle ?? current.solidStyle }}
      {...(brand ? { "data-brand": brand } : {})}
    >
      <Button size="s" tabIndex={-1} aria-hidden label={labels.tiles.sample} />
    </Flex>
  );
}

/** One tile: a radio in its row's group, named by its caption. */
function Tile({
  pressed,
  tabStop,
  onSelect,
  caption,
  children,
}: {
  pressed: boolean;
  tabStop: boolean;
  onSelect: () => void;
  caption: ReactNode;
  children: ReactNode;
}) {
  return (
    <Column
      horizontal="center"
      gap="8"
      padding="8"
      fillWidth
      radius="l"
      border={pressed ? "brand-medium" : "neutral-alpha-medium"}
      background={pressed ? "brand-alpha-weak" : "surface"}
      cursor="interactive"
      tabIndex={tabStop ? 0 : -1}
      role="radio"
      aria-checked={pressed}
      className={classNames("focus-ring", styles.tile)}
      onClick={onSelect}
      onKeyDown={(event) => activateOnKey(event, onSelect)}
    >
      <Flex fillWidth center minHeight="40" aria-hidden className={styles.sample}>
        {children}
      </Flex>
      <Text
        textVariant="label-default-xs"
        onBackground={pressed ? "brand-strong" : "neutral-medium"}
        truncate
      >
        {caption}
      </Text>
    </Column>
  );
}

/** A row's options as tiles, one column each: a radio group named by the row's label. */
function Tiles<T extends string>({
  options,
  selected,
  onSelect,
  name,
}: {
  options: { value: T; caption: ReactNode; sample: TileSample }[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  /** The group's name when its row shows no label: the row's default label. */
  name: ReactNode;
}) {
  const groupName = useGroupName(name);
  const checked = options.some((option) => option.value === selected);
  return (
    <Grid
      fillWidth
      columns={String(options.length) as GridSize}
      gap="8"
      role="radiogroup"
      {...groupName}
      onKeyDown={radioGroupKeyDown}
    >
      {options.map((option, index) => (
        <Tile
          key={option.value}
          pressed={option.value === selected}
          tabStop={checked ? option.value === selected : index === 0}
          onSelect={() => onSelect(option.value)}
          caption={option.caption}
        >
          <SampleButton sample={option.sample} />
        </Tile>
      ))}
    </Grid>
  );
}

/* ---- rows ---------------------------------------------------------------- */

function ThemeRow({ label, ...rest }: StyleRowProps) {
  const labels = useStylePanelLabels();
  // Optional: the row needs no state when bound, so it still renders outside a Root.
  const panel = useContext(StylePanelContext);
  // Controlled, an unset theme is the system one, as it is for ThemeProvider.
  const controlled = panel?.controlled
    ? {
        value: panel.value.theme ?? "system",
        onValueChange: (theme: Theme) => panel.set({ theme }),
      }
    : {};
  return (
    <Row label={prefer(label, labels.rows.theme)} hintFor="theme" {...rest}>
      <ThemeOptions name={labels.rows.theme} labels={labels.themeSwitcher} {...controlled} />
    </Row>
  );
}

/**
 * The Theme row's switcher: a radio group named by the row's label. Rendered
 * inside the Row, so that it can read the label's id.
 */
function ThemeOptions({
  name,
  ...switcher
}: React.ComponentProps<typeof ThemeSwitcher> & { name: ReactNode }) {
  const groupName = useGroupName(name);
  return <ThemeSwitcher semantics="radio" {...groupName} {...switcher} />;
}

/** Shape, Solid and Effect take `tiles`, over the Root's. */
export interface StyleTileRowProps extends StyleRowProps {
  /**
   * Draw each option as a tile: a real button wearing that option, its name
   * under it. Defaults to the Root's `tiles`.
   */
  tiles?: boolean;
}

function ShapeRow({ label, tiles, ...rest }: StyleTileRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  const display = useContext(StylePanelDisplayContext);
  if (tiles ?? display.tiles) {
    return (
      <Row label={prefer(label, labels.rows.shape)} hintFor="shape" above {...rest}>
        <Tiles
          name={labels.rows.shape}
          selected={mounted ? value.border : undefined}
          onSelect={(border) => set({ border })}
          options={shapes.map((shape) => ({
            value: shape,
            caption: capitalise(labels.names.shapes[shape]),
            sample: { border: shape },
          }))}
        />
      </Row>
    );
  }
  return (
    <Row label={prefer(label, labels.rows.shape)} hintFor="shape" {...rest}>
      <Swatches
        options={shapes}
        selected={mounted ? value.border : undefined}
        onSelect={(border) => set({ border })}
        ariaLabel={(shape) => labels.swatches.shape(labels.names.shapes[shape])}
        name={labels.rows.shape}
        dataBorder
      />
    </Row>
  );
}

const SEED_KEYS = { brand: "brandSeed", accent: "accentSeed", neutral: "neutralSeed" } as const;

/** Where a custom colour starts when the host has not given one: the docs' own blue. */
const DEFAULT_SEED = "#5a93fc";

/** What the colour field reports for a colour: `#rrggbb`. Its clear button reports "". */
const isFieldColor = (color: string) => /^#[0-9a-f]{6}$/i.test(color);

/**
 * The seed as the `#rrggbb` a native colour field holds. A seed in another
 * format (`rgb()`, `oklch()`) leaves the field empty rather than showing a
 * wrong colour; the swatch, which CSS paints, still shows it.
 */
function fieldColor(seed: string | undefined): string {
  const hex = seed?.trim().match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i)?.[1];
  if (!hex) return "";
  const rgb = hex.length <= 4 ? [...hex.slice(0, 3)].map((d) => d + d).join("") : hex.slice(0, 6);
  return `#${rgb.toLowerCase()}`;
}

/**
 * The props that lay a row's label out against its control. A row with a
 * custom colour puts its picker under that line rather than in it, so they go
 * to the line, where they mean what they mean on every other row.
 */
function splitLineProps({ direction, horizontal, vertical, gap, wrap, ...row }: StyleRowProps) {
  const line = Object.fromEntries(
    Object.entries({ direction, horizontal, vertical, gap, wrap }).filter(
      ([, prop]) => prop !== undefined,
    ),
  ) as Pick<StyleRowProps, "direction" | "horizontal" | "vertical" | "gap" | "wrap">;
  return { line, row };
}

/**
 * Brand, Accent and Neutral: a strip of swatches, and with `custom` (in
 * controlled mode) one more for a colour of the host's own and a field to
 * pick it.
 */
function colorRow(key: StylePanelSchemeRow | "neutral") {
  const options: readonly string[] = key === "neutral" ? neutrals : schemes;
  return function ColorRow({
    label,
    hint,
    custom = false,
    swatches: layout,
    ...rest
  }: StyleSchemeRowProps) {
    const { value, set, mounted, controlled } = useStylePanel();
    const tip = useRowHint(hint, key);
    const labels = useStylePanelLabels();
    const display = useContext(StylePanelDisplayContext);
    const flush = useContext(StylePanelFlushContext);
    const wrap = (layout ?? display.swatches) === "wrap";
    const stacked = useContext(StylePanelStackedContext) || flush || wrap;
    const pickerId = useId();
    const labelId = useId();
    const current = mounted ? value[key] : undefined;
    const rowLabel = prefer(label, labels.rows[key]);

    const ariaLabel = (option: string) =>
      key === "neutral"
        ? labels.swatches.neutral(labels.names.neutrals[option as NeutralColor])
        : labels.swatches.scheme(labels.names.schemes[option as Schemes], key);
    const swatches = (trailing?: ReactNode) => (
      <Swatches
        options={options}
        selected={current}
        onSelect={(option) => set({ [key]: option })}
        ariaLabel={ariaLabel}
        name={labels.rows[key]}
        trailingChecked={current === "custom"}
        swatchClass={(option) => styles[option]}
        scroll
        wrap={wrap}
        scrollLabels={labels.scroller}
        trailing={trailing}
      />
    );

    // Bound to ThemeProvider there is nowhere to keep a seed, so the custom
    // colour is a controlled-mode feature and the row renders as it always has.
    if (!custom || !controlled) {
      return (
        <Row label={rowLabel} hint={hint} hintFor={key} above={wrap} {...rest}>
          {swatches()}
        </Row>
      );
    }

    const seedKey = SEED_KEYS[key];
    const seed = value[seedKey] || undefined;
    const chosen = current === "custom";
    const words =
      key === "neutral"
        ? {
            swatch: labels.custom.neutral.swatch,
            picker: labels.custom.neutral.picker,
            describe: (from: string) => labels.custom.neutral.description?.(from),
          }
        : {
            swatch: labels.custom.swatch(key),
            picker: labels.custom.picker(key),
            describe: (from: string) => labels.custom.description?.(from, key),
          };
    const description = chosen && seed ? words.describe(seed) : undefined;

    // The picker spans the row under the label and the swatches. The strip
    // stays where it is in the tree whether or not the picker shows, so
    // choosing the last swatch does not reset its scroll.
    const { line, row } = splitLineProps(rest);
    return (
      <Row label={false} direction="row" {...row}>
        <Column fillWidth gap="16">
          <Flex fillWidth {...(stacked ? STACKED_LINE : INLINE_LINE)} {...line}>
            {rowLabel !== false && (
              <RowLabel id={labelId} hint={tip} above={wrap}>
                {rowLabel}
              </RowLabel>
            )}
            <StyleRowLabelContext.Provider value={rowLabel !== false ? labelId : null}>
              {swatches(
                <Swatch
                  label={words.swatch}
                  pressed={chosen}
                  tabStop={chosen}
                  onSelect={() => set({ [key]: "custom", [seedKey]: seed ?? DEFAULT_SEED })}
                  scroll={!wrap}
                >
                  <div
                    className={classNames(styles.swatch, styles.custom, !seed && styles.empty)}
                    style={seed ? { background: seed } : undefined}
                  >
                    {!seed && <Icon name="plus" size="xs" onBackground="neutral-medium" />}
                  </div>
                </Swatch>,
              )}
            </StyleRowLabelContext.Provider>
          </Flex>
          {chosen && (
            <Column fillWidth horizontal={stacked ? "start" : "end"} gap="8">
              <ColorButton
                id={pickerId}
                label={words.picker}
                value={fieldColor(seed)}
                aria-describedby={description ? `${pickerId}-description` : undefined}
                onValueChange={(next) => {
                  if (isFieldColor(next)) set({ [key]: "custom", [seedKey]: next });
                }}
                onValueCommit={(next) => {
                  if (isFieldColor(next)) set({ [key]: "custom", [seedKey]: next });
                }}
              />
              {description && (
                <Text
                  id={`${pickerId}-description`}
                  textVariant="body-default-xs"
                  onBackground="neutral-weak"
                  align="right"
                >
                  {description}
                </Text>
              )}
            </Column>
          )}
        </Column>
      </Row>
    );
  };
}

const BrandRow = colorRow("brand");
const AccentRow = colorRow("accent");
const NeutralRow = colorRow("neutral");

/**
 * A row's segmented options. Beside a label they stop at 22rem; stacked, they
 * have the row to themselves, so they take all of it, and the buttons drop a
 * size so that the longer rows fit a sidebar. Either way the scroll buttons
 * are translated with the rest of the panel. One choice from a set, they are
 * a radio group named by the row's label, as the swatch rows are.
 */
function Options({
  buttons,
  name,
  ...rest
}: Omit<SegmentedControlProps, "labels"> & {
  /** The group's name when its row shows no label: the row's default label. */
  name: ReactNode;
}) {
  const flush = useFlush();
  const stacked = useContext(StylePanelStackedContext) || flush;
  // A small panel drops its buttons a size too, so they match its tighter rows.
  const small = useContext(StylePanelSizeContext) === "s";
  const labels = useStylePanelLabels();
  const groupName = useGroupName(name);
  const size = small ? (stacked ? "s" : "m") : stacked ? "m" : "l";
  return (
    <SegmentedControl
      semantics="radio"
      {...groupName}
      maxWidth={stacked ? undefined : "22rem"}
      minWidth={0}
      labels={labels.scroller}
      buttons={buttons.map((button) => ({ size, ...button }))}
      {...rest}
    />
  );
}

function solidSwatch(solid: string, fill: string, tone: ReactNode) {
  return (
    <Flex vertical="center" gap="12">
      <Flex
        {...(solid ? { "data-solid": solid } : {})}
        border="brand-strong"
        solid={fill as never}
        width="24"
        height="24"
        radius="s"
      />
      {tone}
    </Flex>
  );
}

function segmentedRow<K extends keyof StylePanelValue>(
  key: K,
  row: keyof StylePanelRowLabels,
  buttons: (labels: ResolvedLabels) => { label: ReactNode; value: string }[],
  defaultValue: string,
) {
  return function SegmentedRow({ label, ...rest }: StyleRowProps) {
    const { value, set, mounted } = useStylePanel();
    const labels = useStylePanelLabels();
    return (
      <Row label={prefer(label, labels.rows[row])} hintFor={row} {...rest}>
        <Options
          onValueChange={(next) => set({ [key]: next } as Partial<StylePanelValue>)}
          value={mounted ? (value[key] as string | undefined) : undefined}
          defaultValue={defaultValue}
          name={labels.rows[row]}
          buttons={buttons(labels)}
        />
      </Row>
    );
  };
}

const SOLIDS = ["color", "inverse", "contrast"] as const satisfies readonly SolidType[];
const EFFECTS = ["flat", "plastic", "glow"] as const satisfies readonly SolidStyle[];

const SolidSegmented = segmentedRow(
  "solid",
  "solid",
  ({ options: { solid } }) =>
    SOLIDS.map((value) => ({
      label: solidSwatch(value, value === "color" ? "brand-weak" : "brand-strong", solid[value]),
      value,
    })),
  "contrast",
);

const EffectSegmented = segmentedRow(
  "solidStyle",
  "effect",
  ({ options: { effect } }) =>
    EFFECTS.map((value) => ({ label: solidSwatch("", "brand-weak", effect[value]), value })),
  "flat",
);

function SolidRow({ label, tiles, ...rest }: StyleTileRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  const display = useContext(StylePanelDisplayContext);
  if (!(tiles ?? display.tiles)) return <SolidSegmented label={label} {...rest} />;
  return (
    <Row label={prefer(label, labels.rows.solid)} hintFor="solid" above {...rest}>
      <Tiles
        name={labels.rows.solid}
        selected={mounted ? value.solid : undefined}
        onSelect={(solid) => set({ solid })}
        options={SOLIDS.map((solid) => ({
          value: solid,
          caption: labels.options.solid[solid],
          sample: { solid },
        }))}
      />
    </Row>
  );
}

function EffectRow({ label, tiles, ...rest }: StyleTileRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  const display = useContext(StylePanelDisplayContext);
  if (!(tiles ?? display.tiles)) return <EffectSegmented label={label} {...rest} />;
  return (
    <Row label={prefer(label, labels.rows.effect)} hintFor="effect" above {...rest}>
      <Tiles
        name={labels.rows.effect}
        selected={mounted ? value.solidStyle : undefined}
        onSelect={(solidStyle) => set({ solidStyle })}
        options={EFFECTS.map((solidStyle) => ({
          value: solidStyle,
          caption: labels.options.effect[solidStyle],
          sample: { solidStyle },
        }))}
      />
    </Row>
  );
}

const SurfaceRow = segmentedRow(
  "surface",
  "surface",
  ({ options: { surface } }) => [
    { label: surface.filled, value: "filled" },
    { label: surface.translucent, value: "translucent" },
  ],
  "filled",
);

const DensityRow = segmentedRow(
  "density",
  "density",
  ({ options: { density } }) => [
    { label: density.compact, value: "compact" },
    { label: density.normal, value: "normal" },
    { label: density.spacious, value: "spacious" },
  ],
  "normal",
);

/** Scaling takes the steps it offers, and their names instead of percentages. */
export interface StyleScalingRowProps extends StyleRowProps {
  /**
   * Offer three named steps, Small, Normal and Large (95, 100 and 105, from
   * `labels.options.scalingNames`), instead of the five percentages. For a
   * site owner, who thinks in bigger and smaller rather than in percent.
   */
  named?: boolean;
  /** The steps to offer. Defaults to 90 to 110, or 95 to 105 while `named`. */
  steps?: readonly ScalingSize[];
}

const NAMED_STEPS: readonly ScalingSize[] = ["95", "100", "105"];

function ScalingRow({ label, named = false, steps, ...rest }: StyleScalingRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  const offered = steps ?? (named ? NAMED_STEPS : scalingSizes);
  return (
    <Row label={prefer(label, labels.rows.scaling)} hintFor="scaling" {...rest}>
      <Options
        onValueChange={(next) => set({ scaling: next as ScalingSize })}
        value={mounted ? value.scaling : undefined}
        defaultValue="100"
        name={labels.rows.scaling}
        fillWidth={named || undefined}
        buttons={offered.map((size) => ({
          label: named ? labels.options.scalingNames[size] : labels.options.scaling(size),
          value: size,
        }))}
      />
    </Row>
  );
}

const TransitionRow = segmentedRow(
  "transition",
  "transition",
  ({ options: { transition } }) => [
    { label: transition.all, value: "all" },
    { label: transition.micro, value: "micro" },
    { label: transition.macro, value: "macro" },
    { label: transition.none, value: "none" },
  ],
  "all",
);

const BodySizeRow = segmentedRow(
  "bodySize",
  "bodySize",
  ({ options }) => bodySizes.map((size) => ({ label: options.bodySize(size), value: size })),
  "100",
);

const BodyLineHeightRow = segmentedRow(
  "bodyLineHeight",
  "bodyLineHeight",
  ({ options }) =>
    bodyLineHeights.map((height) => ({ label: options.bodyLineHeight(height), value: height })),
  "100",
);

const dataStyleButtons = ({ options: { dataStyle } }: ResolvedLabels) => [
  { label: dataStyle.categorical, value: "categorical" },
  { label: dataStyle.divergent, value: "divergent" },
  { label: dataStyle.sequential, value: "sequential" },
];

/** Split out so that only this row depends on DataThemeProvider — every other
 *  section can be cherry-picked without one in the tree. */
function BoundDataStyleControl() {
  const { mode, setChartOptions } = useDataTheme();
  const labels = useStylePanelLabels();
  return (
    <Options
      onValueChange={(next) => setChartOptions({ mode: next as ChartMode })}
      value={mode}
      defaultValue="categorical"
      name={labels.rows.dataStyle}
      buttons={dataStyleButtons(labels)}
    />
  );
}

function DataStyleRow({ label, ...rest }: StyleRowProps) {
  const { value, set, mounted, controlled } = useStylePanel();
  const labels = useStylePanelLabels();
  return (
    <Row label={prefer(label, labels.rows.dataStyle)} hintFor="dataStyle" {...rest}>
      {controlled ? (
        <Options
          onValueChange={(next) => set({ chartMode: next as ChartMode })}
          value={mounted ? value.chartMode : undefined}
          defaultValue="categorical"
          name={labels.rows.dataStyle}
          buttons={dataStyleButtons(labels)}
        />
      ) : (
        <BoundDataStyleControl />
      )}
    </Row>
  );
}

/* ---- groups -------------------------------------------------------------- */

const show = (rows: Record<string, boolean | undefined> | undefined, key: string) =>
  rows?.[key] !== false;

/** A group's heading: its own props, else the panel's labels. */
function useGroupHeading(
  group: keyof ResolvedLabels["groups"],
  { title, description }: Pick<StyleGroupProps, "title" | "description">,
) {
  const labels = useStylePanelLabels().groups[group];
  return {
    title: prefer(title, labels.title),
    description: prefer(description, labels.description),
  };
}

function PageGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: StylePanelVisibility["page"] }) {
  return (
    <Group {...useGroupHeading("page", { title, description })} {...rest}>
      {show(rows, "theme") && <ThemeRow />}
      {show(rows, "shape") && <ShapeRow />}
    </Group>
  );
}

function ColorGroup({
  title,
  description,
  rows,
  customColors,
  ...rest
}: StyleGroupProps & { rows?: StylePanelVisibility["color"] } & {
  /**
   * Offer a custom colour: their `custom`. `true` is Brand and Accent; name
   * the rows to choose, Neutral included. Controlled mode only.
   */
  customColors?: StylePanelCustomColors;
}) {
  const offers = (row: StylePanelSchemeRow | "neutral") =>
    Array.isArray(customColors) ? customColors.includes(row) : row !== "neutral" && !!customColors;
  return (
    <Group {...useGroupHeading("color", { title, description })} {...rest}>
      {show(rows, "brand") && <BrandRow custom={offers("brand")} />}
      {show(rows, "accent") && <AccentRow custom={offers("accent")} />}
      {show(rows, "neutral") && <NeutralRow custom={offers("neutral")} />}
    </Group>
  );
}

function SolidStyleGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: StylePanelVisibility["solidStyle"] }) {
  return (
    <Group {...useGroupHeading("solidStyle", { title, description })} {...rest}>
      {show(rows, "solid") && <SolidRow />}
      {show(rows, "effect") && <EffectRow />}
    </Group>
  );
}

function BodyTextGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: StylePanelVisibility["bodyText"] }) {
  return (
    <Group {...useGroupHeading("bodyText", { title, description })} {...rest}>
      {show(rows, "size") && <BodySizeRow />}
      {show(rows, "lineHeight") && <BodyLineHeightRow />}
    </Group>
  );
}

function AdvancedGroup({
  title,
  description,
  rows,
  ...rest
}: StyleGroupProps & { rows?: StylePanelVisibility["advanced"] }) {
  return (
    <Group {...useGroupHeading("advanced", { title, description })} {...rest}>
      {show(rows, "surface") && <SurfaceRow />}
      {show(rows, "density") && <DensityRow />}
      {show(rows, "scaling") && <ScalingRow />}
      {show(rows, "dataStyle") && <DataStyleRow />}
      {show(rows, "transition") && <TransitionRow />}
    </Group>
  );
}

/* ---- fonts --------------------------------------------------------------- */

/** One font pairing on the Fonts row. */
export interface StylePanelFontPair {
  /** What `onValueChange` reports when it is picked. */
  value: string;
  /** Its name, under the sample. */
  label: ReactNode;
  /** The heading face, as a CSS `font-family` value; the sample is drawn in it. */
  heading: string;
  /** A line under the name: the two faces' names, say. */
  description?: ReactNode;
}

export interface StyleFontsRowProps extends StyleRowProps {
  /** The pairings offered, as tiles two to a row. */
  pairs?: readonly StylePanelFontPair[];
  /** The pairing in use, or none when the fonts were chosen one by one. */
  value?: string;
  onValueChange?: (value: string) => void;
  /**
   * What the row's "One by one" toggle shows under the pairings: the host's
   * own per-role font pickers. Without it there is no toggle.
   */
  more?: ReactNode;
  /** Show `more` from the start. */
  defaultMoreOpen?: boolean;
}

/**
 * Fonts as pairings: a tile per pair, drawn in its heading face, and an
 * optional "One by one" escape to the host's own pickers. The panel keeps no
 * font state (ThemeProvider has none), so the row is controlled by its own
 * `value` in either mode.
 */
function FontsRow({
  label,
  pairs = [],
  value,
  onValueChange,
  more,
  defaultMoreOpen = false,
  ...rest
}: StyleFontsRowProps) {
  const labels = useStylePanelLabels();
  const [open, setOpen] = useState(defaultMoreOpen);
  return (
    <Row label={prefer(label, labels.rows.fonts)} hintFor="fonts" above {...rest}>
      <Column fillWidth gap="8">
        <FontPairs pairs={pairs} value={value} onValueChange={onValueChange} />
        {more && (
          <Flex>
            <Button
              size="s"
              variant="tertiary"
              weight="default"
              suffixIcon={open ? "chevronUp" : "chevronDown"}
              aria-expanded={open}
              onClick={() => setOpen((was) => !was)}
            >
              {labels.fonts.more}
            </Button>
          </Flex>
        )}
        {more && open && more}
      </Column>
    </Row>
  );
}

/** The pairings: inside the Row, so the group is named by the row's label. */
function FontPairs({
  pairs,
  value,
  onValueChange,
}: Pick<StyleFontsRowProps, "value" | "onValueChange"> & {
  pairs: readonly StylePanelFontPair[];
}) {
  const labels = useStylePanelLabels();
  const groupName = useGroupName(labels.rows.fonts);
  const checked = pairs.some((pair) => pair.value === value);
  return (
    <Grid
      fillWidth
      columns={2}
      gap="8"
      role="radiogroup"
      {...groupName}
      onKeyDown={radioGroupKeyDown}
    >
      {pairs.map((pair, index) => {
        const pressed = pair.value === value;
        const select = () => onValueChange?.(pair.value);
        return (
          <Column
            key={pair.value}
            gap="4"
            padding="12"
            fillWidth
            radius="l"
            border={pressed ? "brand-medium" : "neutral-alpha-medium"}
            background={pressed ? "brand-alpha-weak" : "surface"}
            cursor="interactive"
            tabIndex={(checked ? pressed : index === 0) ? 0 : -1}
            role="radio"
            aria-checked={pressed}
            className={classNames("focus-ring", styles.tile)}
            onClick={select}
            onKeyDown={(event) => activateOnKey(event, select)}
          >
            <Text
              aria-hidden
              onBackground="neutral-strong"
              className={styles.pairSample}
              style={{ fontFamily: pair.heading }}
            >
              {labels.fonts.sample}
            </Text>
            <Text
              textVariant="label-strong-xs"
              onBackground={pressed ? "brand-strong" : "neutral-strong"}
              truncate
            >
              {pair.label}
            </Text>
            {pair.description && (
              <Text textVariant="body-default-xs" onBackground="neutral-weak" truncate>
                {pair.description}
              </Text>
            )}
          </Column>
        );
      })}
    </Grid>
  );
}

/* ---- site ---------------------------------------------------------------- */

export interface StylePanelSectionProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  title?: ReactNode | false;
  /** Beside the title on the right: a Reset, say. */
  action?: ReactNode;
}

/**
 * A plain section: a title, an optional action, and rows that sit flush
 * under it, each label above its control, as fields in a form. No border:
 * `StylePanelSite` separates its sections with lines.
 */
function Section({ title, action, children, ...rest }: StylePanelSectionProps) {
  return (
    <Column fillWidth gap="16" {...rest}>
      {(title || action) && (
        <Flex fillWidth horizontal="between" vertical="center" gap="8" minHeight="32">
          {title ? (
            <Text textVariant="label-strong-m" onBackground="neutral-strong">
              {title}
            </Text>
          ) : (
            <Flex />
          )}
          {action}
        </Flex>
      )}
      <StylePanelFlushContext.Provider value={true}>
        <Column fillWidth gap="20">
          {children}
        </Column>
      </StylePanelFlushContext.Provider>
    </Column>
  );
}

export interface StylePanelSiteProps extends StylePanelRootProps {
  /**
   * The first section's content: the host's own starting points (templates,
   * looks), which the panel knows nothing about. Left out, there is no Look
   * section.
   */
  look?: ReactNode;
  /** Beside the Look title: "Edited" and a Reset, say. */
  lookAction?: ReactNode;
  /**
   * End the colour rows' swatches with one for the host's own colour, as on
   * `StylePanel`. Controlled mode only.
   */
  customColors?: StylePanelCustomColors;
  /** The Fonts section: its pairings and their state. Left out, there is none. */
  fonts?: Omit<StyleFontsRowProps, keyof StyleRowProps>;
  /** More rows at the end of Fine-tune: a page width, say. */
  fineTune?: ReactNode;
  /** Fine-tune starts open. */
  defaultFineTuneOpen?: boolean;
}

/**
 * The style panel for a site builder: every option on screen, each drawn as
 * the thing it changes. Look (the host's own), Colour (main colour as
 * swatches that wrap, light or dark), Shape and buttons (corners, finish and
 * fill as tiles of real buttons), Fonts as pairings, then Fine-tune folded
 * away: text size in words, surfaces, the second colour and the greys.
 *
 * It is a composition of the panel's own parts on `StylePanelRoot`, with
 * `tiles` and `swatches="wrap"` on; compose them directly for another order.
 */
function Site({
  look,
  lookAction,
  customColors,
  fonts,
  fineTune,
  defaultFineTuneOpen = false,
  tiles = true,
  swatches = "wrap",
  gap = "24",
  ...rest
}: StylePanelSiteProps) {
  return (
    <Root tiles={tiles} swatches={swatches} gap={gap} {...rest}>
      <SiteSections
        look={look}
        lookAction={lookAction}
        customColors={customColors}
        fonts={fonts}
        fineTune={fineTune}
        defaultFineTuneOpen={defaultFineTuneOpen}
      />
    </Root>
  );
}

/** Inside the Root, so the headings read its labels. */
function SiteSections({
  look,
  lookAction,
  customColors,
  fonts,
  fineTune,
  defaultFineTuneOpen,
}: Pick<
  StylePanelSiteProps,
  "look" | "lookAction" | "customColors" | "fonts" | "fineTune" | "defaultFineTuneOpen"
>) {
  const { groups } = useStylePanelLabels();
  const offers = (row: StylePanelSchemeRow | "neutral") =>
    Array.isArray(customColors) ? customColors.includes(row) : row !== "neutral" && !!customColors;
  const divider = <Line background="neutral-alpha-weak" />;
  return (
    <>
      {look && (
        <>
          <Section title={groups.look.title} action={lookAction}>
            {look}
          </Section>
          {divider}
        </>
      )}
      <Section title={groups.color.title}>
        <BrandRow custom={offers("brand")} />
        <ThemeRow />
      </Section>
      {divider}
      <Section title={groups.shape.title}>
        <ShapeRow />
        <EffectRow />
        <SolidRow />
      </Section>
      {fonts && (
        <>
          {divider}
          <Section title={groups.fonts.title}>
            <FontsRow label={false} {...fonts} />
          </Section>
        </>
      )}
      <Column fillWidth border="neutral-alpha-medium" radius="l" overflow="hidden">
        <Accordion
          title={groups.fineTune.title}
          titleVariant="label-default-s"
          size="s"
          radius="none"
          defaultOpen={defaultFineTuneOpen}
        >
          <Section paddingBottom="8">
            <ScalingRow named />
            <SurfaceRow />
            <AccentRow custom={offers("accent")} />
            <NeutralRow custom={offers("neutral")} />
            {fineTune}
          </Section>
        </Accordion>
      </Column>
    </>
  );
}

/*
 * Each section is its own named export: `StylePanelRoot`, `StylePanelBrand`
 * and the rest. 3.0 drops the `StylePanel.Brand` statics, which a server
 * component cannot reach through a client module.
 */
/*
 * For MascotPanel, which lays its rows out the same way. Not re-exported from
 * the package: StylePanel.tsx names its public exports one by one.
 */
export {
  AccentRow as StylePanelAccent,
  AdvancedGroup as StylePanelAdvanced,
  BodyLineHeightRow as StylePanelBodyLineHeight,
  BodySizeRow as StylePanelBodySize,
  BodyTextGroup as StylePanelBodyText,
  BrandRow as StylePanelBrand,
  ColorGroup as StylePanelColor,
  DataStyleRow as StylePanelDataStyle,
  DensityRow as StylePanelDensity,
  EffectRow as StylePanelEffect,
  FontsRow as StylePanelFonts,
  Group as StylePanelGroup,
  NeutralRow as StylePanelNeutral,
  Options as StylePanelOptions,
  PageGroup as StylePanelPage,
  Root as StylePanelRoot,
  Row as StylePanelRow,
  ScalingRow as StylePanelScaling,
  Section as StylePanelSection,
  ShapeRow as StylePanelShape,
  Site as StylePanelSite,
  SolidRow as StylePanelSolid,
  SolidStyleGroup as StylePanelSolidStyle,
  StylePanelSizeContext,
  StylePanelStackedContext,
  SurfaceRow as StylePanelSurface,
  ThemeRow as StylePanelTheme,
  TransitionRow as StylePanelTransition,
  useGroupName,
  useStylePanel,
};
