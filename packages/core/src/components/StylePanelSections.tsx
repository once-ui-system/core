"use client";

import classNames from "clsx";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDataTheme } from "../contexts/DataThemeProvider";
import {
  type BodyLineHeight,
  type BodySize,
  type BorderStyle,
  type NeutralColor,
  type ScalingSize,
  type SolidStyle,
  type SolidType,
  type SurfaceStyle,
  type Theme,
  type TransitionStyle,
  useStyle,
} from "../contexts/ThemeProvider";
import { mergeLabels } from "../internal/labels";
import type { ChartMode } from "../modules/data/interfaces";
import { type Schemes, schemes } from "../types";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Scroller } from "./Scroller";
import { SegmentedControl } from "./SegmentedControl";
import styles from "./StylePanel.module.scss";
import { Text } from "./Text";
import { ThemeSwitcher, type ThemeSwitcherLabels } from "./ThemeSwitcher";

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
  transition?: TransitionStyle;
  bodySize?: BodySize;
  bodyLineHeight?: BodyLineHeight;
  chartMode?: ChartMode;
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
    scaling?: boolean;
    dataStyle?: boolean;
    transition?: boolean;
  };
}

/** `label={false}` drops the row's label; any node replaces it. */
export interface StyleRowProps extends Omit<React.ComponentProps<typeof Flex>, "label"> {
  label?: ReactNode | false;
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
}

/** A labels type with every field filled in, at every depth. */
type Complete<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (...args: never[]) => unknown
    ? NonNullable<T[K]>
    : NonNullable<T[K]> extends object
      ? Complete<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};

/** The theme switcher keeps its own English defaults, so they live in one place. */
type ResolvedLabels = Complete<Omit<StylePanelLabels, "themeSwitcher">> & {
  themeSwitcher: ThemeSwitcherLabels;
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
};

/**
 * The merged labels. Its default is the English set rather than nothing, so
 * a row rendered outside a Root — `StylePanel.Theme` needs no state — still
 * has its text.
 */
const StylePanelLabelsContext = createContext<ResolvedLabels>(DEFAULT_LABELS);

const useStylePanelLabels = () => useContext(StylePanelLabelsContext);

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

/** Reads and writes ThemeProvider — the default when no `value`/`onChange` is given. */
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
  /** Supply with `onChange` to take ownership of the state. The panel then
   *  writes nothing to ThemeProvider, DataThemeProvider or storage. */
  value?: StylePanelValue;
  onChange?: (next: StylePanelValue, changed: Partial<StylePanelValue>) => void;
  /** Every string the panel shows or announces, over the English defaults.
   *  Every group and row inside reads them; their own props still win. */
  labels?: StylePanelLabels;
}

const Root = forwardRef<HTMLDivElement, StylePanelRootProps>(function Root(
  { value, onChange, labels, children, ...rest },
  ref,
) {
  const bound = useBoundState();
  const controlled = value !== undefined && onChange !== undefined;

  const controlledSet = useCallback(
    (patch: Partial<StylePanelValue>) => onChange?.({ ...value, ...patch }, patch),
    [value, onChange],
  );

  const context = useMemo<StylePanelContextValue>(
    () =>
      controlled
        ? { value: value!, set: controlledSet, mounted: true, controlled: true }
        : { ...bound, controlled: false },
    [controlled, value, controlledSet, bound],
  );

  const resolvedLabels = useMemo(() => mergeLabels(DEFAULT_LABELS, labels), [labels]);

  return (
    <StylePanelContext.Provider value={context}>
      <StylePanelLabelsContext.Provider value={resolvedLabels}>
        <Column fillWidth gap="16" ref={ref} {...rest}>
          {children}
        </Column>
      </StylePanelLabelsContext.Provider>
    </StylePanelContext.Provider>
  );
});

/* ---- primitives ---------------------------------------------------------- */

/** One labelled row. Dividers come from the group's stylesheet rather than a
 *  prop, so cherry-picking rows never leaves a dangling border. */
function Row({ label, children, ...rest }: StyleRowProps) {
  return (
    <Flex
      className={styles.row}
      horizontal="between"
      vertical="center"
      fillWidth
      paddingX="24"
      paddingY="16"
      gap="24"
      {...rest}
    >
      {label !== false && (
        <Flex textVariant="label-default-s" minWidth={3} onBackground="neutral-strong">
          {label}
        </Flex>
      )}
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
            <Text variant="heading-strong-s" onBackground="neutral-strong">
              {title}
            </Text>
          )}
          {description !== false && (
            <Text variant="body-default-s" onBackground="neutral-weak">
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

function Swatches<T extends string>({
  options,
  selected,
  onSelect,
  ariaLabel,
  scroll,
  swatchClass,
  dataBorder,
}: {
  options: readonly T[];
  selected: T | undefined;
  onSelect: (value: T) => void;
  ariaLabel: (value: T) => string;
  scroll?: boolean;
  swatchClass?: (value: T) => string;
  dataBorder?: boolean;
}) {
  const items = options.map((option) => (
    <Flex
      key={option}
      {...(dataBorder ? { "data-border": option } : {})}
      marginRight={scroll ? "2" : undefined}
      center
      tabIndex={0}
      role="button"
      aria-label={ariaLabel(option)}
      aria-pressed={selected === option}
      className={classNames(styles.select, selected === option ? styles.selected : "")}
      onClick={() => onSelect(option)}
    >
      {/* Decorative: the parent Flex is the control. */}
      <IconButton variant="ghost" size="m" aria-hidden>
        <div
          className={classNames(swatchClass ? swatchClass(option) : styles.neutral, styles.swatch)}
        />
      </IconButton>
    </Flex>
  ));

  return scroll ? (
    <Scroller minWidth={0} fitWidth>
      {items}
    </Scroller>
  ) : (
    <Flex gap="4">{items}</Flex>
  );
}

/* ---- rows ---------------------------------------------------------------- */

function ThemeRow({ label, ...rest }: StyleRowProps) {
  const labels = useStylePanelLabels();
  return (
    <Row label={prefer(label, labels.rows.theme)} {...rest}>
      <ThemeSwitcher labels={labels.themeSwitcher} />
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

function schemeRow(key: StylePanelSchemeRow) {
  return function SchemeRow({ label, ...rest }: StyleRowProps) {
    const { value, set, mounted } = useStylePanel();
    const labels = useStylePanelLabels();
    return (
      <Row label={prefer(label, labels.rows[key])} {...rest}>
        <Swatches
          options={schemes}
          selected={mounted ? (value[key] as Schemes) : undefined}
          onSelect={(scheme) => set({ [key]: scheme as Schemes })}
          ariaLabel={(scheme) =>
            labels.swatches.scheme(labels.names.schemes[scheme as Schemes], key)
          }
          swatchClass={(scheme) => styles[scheme]}
          scroll
        />
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
      />
    </Row>
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
        <SegmentedControl
          maxWidth={22}
          minWidth={0}
          onChange={(next) => set({ [key]: next } as Partial<StylePanelValue>)}
          value={mounted ? (value[key] as string | undefined) : undefined}
          defaultValue={defaultValue}
          buttons={buttons(labels).map((button) => ({ size: "l" as const, ...button }))}
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
  { size: "l" as const, label: dataStyle.categorical, value: "categorical" },
  { size: "l" as const, label: dataStyle.divergent, value: "divergent" },
  { size: "l" as const, label: dataStyle.sequential, value: "sequential" },
];

/** Split out so that only this row depends on DataThemeProvider — every other
 *  section can be cherry-picked without one in the tree. */
function BoundDataStyleControl() {
  const { mode, setChartOptions } = useDataTheme();
  const labels = useStylePanelLabels();
  return (
    <SegmentedControl
      maxWidth={22}
      minWidth={0}
      onChange={(next) => setChartOptions({ mode: next as ChartMode })}
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
        <SegmentedControl
          maxWidth={22}
          minWidth={0}
          onChange={(next) => set({ chartMode: next as ChartMode })}
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
  ...rest
}: GroupProps<"brand" | "accent" | "neutral">) {
  return (
    <Group {...useGroupHeading("color", { title, description })} {...rest}>
      {show(rows, "brand") && <BrandRow />}
      {show(rows, "accent") && <AccentRow />}
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
}: GroupProps<"surface" | "scaling" | "dataStyle" | "transition">) {
  return (
    <Group {...useGroupHeading("advanced", { title, description })} {...rest}>
      {show(rows, "surface") && <SurfaceRow />}
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
