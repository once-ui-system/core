"use client";

import {
  type BodyLineHeight,
  type BodySize,
  type BorderStyle,
  type DataStyle as ChartMode,
  ColorInput,
  Column,
  type Density,
  Flex,
  Icon,
  IconButton,
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
import { revealInStrip } from "./internal/reveal.js";
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
}

/** Brand and Accent take one more prop than the other rows. */
export interface StyleSchemeRowProps extends StyleRowProps {
  /**
   * End the swatches with one for a colour of the host's own, painted with
   * the current seed, and edit the seed in a colour field while it is
   * chosen. Choosing it reports `{ brand: "custom", brandSeed }` (or the
   * accent pair) through `onValueChange`.
   *
   * Controlled mode only. Bound to ThemeProvider, whose `setStyle` takes no
   * seed, the panel has nowhere to put one, so the swatch does not render.
   */
  custom?: boolean;
}

export interface StyleGroupProps extends Omit<React.ComponentProps<typeof Column>, "title"> {
  title?: ReactNode | false;
  description?: ReactNode | false;
}

/* ---- labels -------------------------------------------------------------- */

/** The two colour rows, Brand and Accent. */
export type StylePanelSchemeRow = "brand" | "accent";

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
}

/** Each row's label, keyed by the row's part name (`StylePanel.BodySize` → `bodySize`). */
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

/** The custom colour on the Brand and Accent rows (`custom`). */
export interface StylePanelCustomLabels {
  /** The custom swatch's accessible name. Defaults to `Brand colour: custom` (`Accent colour: custom`). */
  swatch?: (row: StylePanelSchemeRow) => string;
  /** The colour field's label. Defaults to `Custom brand colour` (`Custom accent colour`). */
  picker?: (row: StylePanelSchemeRow) => string;
  /** Text under the colour field, from the current seed: a contrast hint, say. None by default. */
  description?: (seed: string, row: StylePanelSchemeRow) => ReactNode;
  /** The colour field's clear button. Defaults to ColorInput's `"Remove"`. */
  remove?: string;
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
    Pick<StylePanelCustomLabels, "description" | "remove">;
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
  },
  options: {
    solid: { color: "Color", inverse: "Inverse", contrast: "Contrast" },
    effect: { flat: "Flat", plastic: "Plastic" },
    surface: { filled: "Filled", translucent: "Translucent" },
    transition: { all: "All", micro: "Micro", macro: "Macro", none: "None" },
    dataStyle: { categorical: "Categorical", divergent: "Divergent", sequential: "Sequential" },
    density: { compact: "Compact", normal: "Normal", spacious: "Spacious" },
    scaling: (value) => value,
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
  custom: {
    swatch: (row) => `${row === "brand" ? "Brand" : "Accent"} colour: custom`,
    picker: (row) => `Custom ${row} colour`,
  },
};

/**
 * The merged labels. Its default is the English set rather than nothing, so
 * a row rendered outside a Root — `StylePanel.Theme` needs no state — still
 * has its text.
 */
const StylePanelLabelsContext = createContext<ResolvedLabels>(DEFAULT_LABELS);

const useStylePanelLabels = () => useContext(StylePanelLabelsContext);

/** Whether rows put their label above their control. False outside a Root. */
const StylePanelStackedContext = createContext(false);

/** How a row lays its label against its control: beside it, or above it. */
const INLINE_LINE = { horizontal: "between", vertical: "center", gap: "24" } as const;
const STACKED_LINE = {
  direction: "column",
  horizontal: "start",
  vertical: "start",
  gap: "12",
} as const;

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
      "StylePanel sections must be rendered inside a <StylePanel> or <StylePanel.Root>",
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
}

const Root = function Root({
  ref,
  value,
  onValueChange,
  labels,
  stacked = false,
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

  return (
    <StylePanelContext.Provider value={context}>
      <StylePanelLabelsContext.Provider value={resolvedLabels}>
        <StylePanelStackedContext.Provider value={stacked}>
          <Column fillWidth gap="16" ref={ref} {...rest}>
            {children}
          </Column>
        </StylePanelStackedContext.Provider>
      </StylePanelLabelsContext.Provider>
    </StylePanelContext.Provider>
  );
};

/* ---- primitives ---------------------------------------------------------- */

function RowLabel({ children }: { children: ReactNode }) {
  return (
    <Flex textVariant="label-default-s" minWidth="3rem" onBackground="neutral-strong">
      {children}
    </Flex>
  );
}

/** One labelled row. Dividers come from the group's stylesheet rather than a
 *  prop, so cherry-picking rows never leaves a dangling border. A host's
 *  `className` joins the row's own rather than replacing it, which would
 *  drop the divider. */
function Row({ label, children, className, ...rest }: StyleRowProps) {
  const stacked = useContext(StylePanelStackedContext);
  return (
    <Flex
      className={classNames(styles.row, className)}
      fillWidth
      paddingX={stacked ? "16" : "24"}
      paddingY="16"
      {...(stacked ? STACKED_LINE : INLINE_LINE)}
      {...rest}
    >
      {label !== false && <RowLabel>{label}</RowLabel>}
      {children}
    </Flex>
  );
}

function Group({ title, description, children, ...rest }: StyleGroupProps) {
  return (
    <Column fillWidth gap="16" {...rest}>
      {(title !== false || description !== false) && (
        <Column fillWidth paddingTop="12" paddingLeft="16" gap="4">
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

/** One swatch: a toggle button, named and pressed, with a decorative face. */
function Swatch({
  label,
  pressed,
  onSelect,
  scroll,
  dataBorder,
  children,
}: {
  label: string;
  pressed: boolean;
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
    revealInStrip(swatch, swatch.parentElement, document.activeElement === swatch);
  }, [scroll, pressed]);

  return (
    <Flex
      ref={ref}
      {...(dataBorder ? { "data-border": dataBorder } : {})}
      marginRight={scroll ? "2" : undefined}
      center
      tabIndex={0}
      role="button"
      aria-label={label}
      aria-pressed={pressed}
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
  scrollLabels,
}: {
  options: readonly T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  ariaLabel: (value: T) => string;
  scroll?: boolean;
  /** The strip's scroll buttons, when `scroll` is set. */
  scrollLabels?: ScrollerLabels;
  swatchClass?: (value: T) => string;
  dataBorder?: boolean;
  /** One more swatch after the options, in the same strip. */
  trailing?: ReactNode;
}) {
  const items = options.map((option) => (
    <Swatch
      key={option}
      label={ariaLabel(option)}
      pressed={selected === option}
      onSelect={() => onSelect(option)}
      scroll={scroll}
      dataBorder={dataBorder ? option : undefined}
    >
      <div
        className={classNames(swatchClass ? swatchClass(option) : styles.neutral, styles.swatch)}
      />
    </Swatch>
  ));

  return scroll ? (
    <Scroller minWidth={0} fitWidth className={styles.strip} labels={scrollLabels}>
      {items}
      {trailing}
    </Scroller>
  ) : (
    <Flex gap="4">
      {items}
      {trailing}
    </Flex>
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
    <Row label={prefer(label, labels.rows.theme)} {...rest}>
      <ThemeSwitcher labels={labels.themeSwitcher} {...controlled} />
    </Row>
  );
}

function ShapeRow({ label, ...rest }: StyleRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  return (
    <Row label={prefer(label, labels.rows.shape)} {...rest}>
      <Swatches
        options={shapes}
        selected={mounted ? value.border : undefined}
        onSelect={(border) => set({ border })}
        ariaLabel={(shape) => labels.swatches.shape(labels.names.shapes[shape])}
        dataBorder
      />
    </Row>
  );
}

const SEED_KEYS = { brand: "brandSeed", accent: "accentSeed" } as const;

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

function schemeRow(key: StylePanelSchemeRow) {
  return function SchemeRow({ label, custom = false, ...rest }: StyleSchemeRowProps) {
    const { value, set, mounted, controlled } = useStylePanel();
    const labels = useStylePanelLabels();
    const stacked = useContext(StylePanelStackedContext);
    const pickerId = useId();
    const current = mounted ? value[key] : undefined;
    const rowLabel = prefer(label, labels.rows[key]);

    const swatches = (trailing?: ReactNode) => (
      <Swatches
        options={schemes}
        selected={current as Schemes}
        onSelect={(scheme) => set({ [key]: scheme as Schemes })}
        ariaLabel={(scheme) => labels.swatches.scheme(labels.names.schemes[scheme as Schemes], key)}
        swatchClass={(scheme) => styles[scheme]}
        scroll
        scrollLabels={labels.scroller}
        trailing={trailing}
      />
    );

    // Bound to ThemeProvider there is nowhere to keep a seed, so the custom
    // colour is a controlled-mode feature and the row renders as it always has.
    if (!custom || !controlled) {
      return (
        <Row label={rowLabel} {...rest}>
          {swatches()}
        </Row>
      );
    }

    const seedKey = SEED_KEYS[key];
    const seed = value[seedKey] || undefined;
    const chosen = current === "custom";
    const description = chosen && seed ? labels.custom.description?.(seed, key) : undefined;

    // The picker spans the row under the label and the swatches. The strip
    // stays where it is in the tree whether or not the picker shows, so
    // choosing the last swatch does not reset its scroll.
    const { line, row } = splitLineProps(rest);
    return (
      <Row label={false} direction="row" {...row}>
        <Column fillWidth gap="16">
          <Flex fillWidth {...(stacked ? STACKED_LINE : INLINE_LINE)} {...line}>
            {rowLabel !== false && <RowLabel>{rowLabel}</RowLabel>}
            {swatches(
              <Swatch
                label={labels.custom.swatch(key)}
                pressed={chosen}
                onSelect={() => set({ [key]: "custom", [seedKey]: seed ?? DEFAULT_SEED })}
                scroll
              >
                <div
                  className={classNames(styles.swatch, styles.custom, !seed && styles.empty)}
                  style={seed ? { background: seed } : undefined}
                >
                  {!seed && <Icon name="plus" size="xs" onBackground="neutral-medium" />}
                </div>
              </Swatch>,
            )}
          </Flex>
          {chosen && (
            <ColorInput
              id={pickerId}
              label={labels.custom.picker(key)}
              value={fieldColor(seed)}
              onValueChange={(next) => {
                // The clear button reports "": keep the seed rather than
                // leave the scheme pointing at nothing.
                if (isFieldColor(next)) set({ [key]: "custom", [seedKey]: next });
              }}
              description={description}
              aria-describedby={description ? `${pickerId}-description` : undefined}
              labels={{ remove: labels.custom.remove }}
            />
          )}
        </Column>
      </Row>
    );
  };
}

const BrandRow = schemeRow("brand");
const AccentRow = schemeRow("accent");

function NeutralRow({ label, ...rest }: StyleRowProps) {
  const { value, set, mounted } = useStylePanel();
  const labels = useStylePanelLabels();
  return (
    <Row label={prefer(label, labels.rows.neutral)} {...rest}>
      <Swatches
        options={neutrals}
        selected={mounted ? value.neutral : undefined}
        onSelect={(neutral) => set({ neutral })}
        ariaLabel={(neutral) =>
          labels.swatches.neutral(labels.names.neutrals[neutral as NeutralColor])
        }
        swatchClass={(neutral) => styles[neutral]}
        scroll
        scrollLabels={labels.scroller}
      />
    </Row>
  );
}

/**
 * A row's segmented options. Beside a label they stop at 22rem; stacked, they
 * have the row to themselves, so they take all of it, and the buttons drop a
 * size so that the longer rows fit a sidebar. Either way the scroll buttons
 * are translated with the rest of the panel.
 */
function Options({ buttons, ...rest }: Omit<SegmentedControlProps, "labels">) {
  const stacked = useContext(StylePanelStackedContext);
  const labels = useStylePanelLabels();
  return (
    <SegmentedControl
      maxWidth={stacked ? undefined : "22rem"}
      minWidth={0}
      labels={labels.scroller}
      buttons={buttons.map((button) => ({ size: stacked ? "m" : "l", ...button }))}
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
      <Row label={prefer(label, labels.rows[row])} {...rest}>
        <Options
          onValueChange={(next) => set({ [key]: next } as Partial<StylePanelValue>)}
          value={mounted ? (value[key] as string | undefined) : undefined}
          defaultValue={defaultValue}
          buttons={buttons(labels)}
        />
      </Row>
    );
  };
}

const SolidRow = segmentedRow(
  "solid",
  "solid",
  ({ options: { solid } }) => [
    { label: solidSwatch("color", "brand-weak", solid.color), value: "color" },
    { label: solidSwatch("inverse", "brand-strong", solid.inverse), value: "inverse" },
    { label: solidSwatch("contrast", "brand-strong", solid.contrast), value: "contrast" },
  ],
  "contrast",
);

const EffectRow = segmentedRow(
  "solidStyle",
  "effect",
  ({ options: { effect } }) => [
    { label: solidSwatch("", "brand-weak", effect.flat), value: "flat" },
    { label: solidSwatch("", "brand-weak", effect.plastic), value: "plastic" },
  ],
  "flat",
);

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

const ScalingRow = segmentedRow(
  "scaling",
  "scaling",
  ({ options }) => scalingSizes.map((size) => ({ label: options.scaling(size), value: size })),
  "100",
);

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
      buttons={dataStyleButtons(labels)}
    />
  );
}

function DataStyleRow({ label, ...rest }: StyleRowProps) {
  const { value, set, mounted, controlled } = useStylePanel();
  const labels = useStylePanelLabels();
  return (
    <Row label={prefer(label, labels.rows.dataStyle)} {...rest}>
      {controlled ? (
        <Options
          onValueChange={(next) => set({ chartMode: next as ChartMode })}
          value={mounted ? value.chartMode : undefined}
          defaultValue="categorical"
          buttons={dataStyleButtons(labels)}
        />
      ) : (
        <BoundDataStyleControl />
      )}
    </Row>
  );
}

/* ---- groups -------------------------------------------------------------- */

type GroupProps<Rows extends string> = StyleGroupProps & { rows?: Partial<Record<Rows, boolean>> };

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

function PageGroup({ title, description, rows, ...rest }: GroupProps<"theme" | "shape">) {
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
}: GroupProps<"brand" | "accent" | "neutral"> & {
  /** Offer a custom colour on Brand and Accent: their `custom`. Controlled mode only. */
  customColors?: boolean;
}) {
  return (
    <Group {...useGroupHeading("color", { title, description })} {...rest}>
      {show(rows, "brand") && <BrandRow custom={customColors} />}
      {show(rows, "accent") && <AccentRow custom={customColors} />}
      {show(rows, "neutral") && <NeutralRow />}
    </Group>
  );
}

function SolidStyleGroup({ title, description, rows, ...rest }: GroupProps<"solid" | "effect">) {
  return (
    <Group {...useGroupHeading("solidStyle", { title, description })} {...rest}>
      {show(rows, "solid") && <SolidRow />}
      {show(rows, "effect") && <EffectRow />}
    </Group>
  );
}

function BodyTextGroup({ title, description, rows, ...rest }: GroupProps<"size" | "lineHeight">) {
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
}: GroupProps<"surface" | "density" | "scaling" | "dataStyle" | "transition">) {
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

export const sections = {
  Root,
  Group,
  Row,
  Theme: ThemeRow,
  Shape: ShapeRow,
  Brand: BrandRow,
  Accent: AccentRow,
  Neutral: NeutralRow,
  Solid: SolidRow,
  Effect: EffectRow,
  Surface: SurfaceRow,
  Density: DensityRow,
  Scaling: ScalingRow,
  Transition: TransitionRow,
  DataStyle: DataStyleRow,
  BodySize: BodySizeRow,
  BodyLineHeight: BodyLineHeightRow,
  Page: PageGroup,
  Color: ColorGroup,
  SolidStyle: SolidStyleGroup,
  BodyText: BodyTextGroup,
  Advanced: AdvancedGroup,
};

export { useStylePanel };
