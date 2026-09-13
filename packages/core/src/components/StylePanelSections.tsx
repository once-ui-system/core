"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Column, Flex, IconButton, Scroller, SegmentedControl, Text, ThemeSwitcher } from ".";
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
import { useDataTheme } from "../contexts/DataThemeProvider";
import { type Schemes, schemes } from "../types";
import type { ChartMode } from "../modules/data";
import styles from "./StylePanel.module.scss";
import classNames from "clsx";

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
    throw new Error("StylePanel sections must be rendered inside a <StylePanel> or <StylePanel.Root>");
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
}

const Root = forwardRef<HTMLDivElement, StylePanelRootProps>(function Root(
  { value, onChange, children, ...rest },
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

  return (
    <StylePanelContext.Provider value={context}>
      <Column fillWidth gap="16" ref={ref} {...rest}>
        {children}
      </Column>
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

const shapes = ["sharp", "conservative", "playful", "rounded"] as const;
const neutrals = ["gray", "sand", "slate", "dusk", "mint", "rose"] as const;

function ThemeRow({ label = "Theme", ...rest }: StyleRowProps) {
  return (
    <Row label={label} {...rest}>
      <ThemeSwitcher />
    </Row>
  );
}

function ShapeRow({ label = "Shape", ...rest }: StyleRowProps) {
  const { value, set, mounted } = useStylePanel();
  return (
    <Row label={label} {...rest}>
      <Swatches
        options={shapes}
        selected={mounted ? (value.border as (typeof shapes)[number]) : undefined}
        onSelect={(border) => set({ border: border as BorderStyle })}
        ariaLabel={(shape) => `Corner style: ${shape}`}
        dataBorder
      />
    </Row>
  );
}

function schemeRow(key: "brand" | "accent", fallback: string) {
  return function SchemeRow({ label = fallback, ...rest }: StyleRowProps) {
    const { value, set, mounted } = useStylePanel();
    return (
      <Row label={label} {...rest}>
        <Swatches
          options={schemes}
          selected={mounted ? (value[key] as Schemes) : undefined}
          onSelect={(scheme) => set({ [key]: scheme as Schemes })}
          ariaLabel={(scheme) => `${fallback} colour: ${scheme}`}
          swatchClass={(scheme) => styles[scheme]}
          scroll
        />
      </Row>
    );
  };
}

const BrandRow = schemeRow("brand", "Brand");
const AccentRow = schemeRow("accent", "Accent");

function NeutralRow({ label = "Neutral", ...rest }: StyleRowProps) {
  const { value, set, mounted } = useStylePanel();
  return (
    <Row label={label} {...rest}>
      <Swatches
        options={neutrals}
        selected={mounted ? (value.neutral as (typeof neutrals)[number]) : undefined}
        onSelect={(neutral) => set({ neutral: neutral as NeutralColor })}
        ariaLabel={(neutral) => `Neutral colour: ${neutral}`}
        swatchClass={(neutral) => styles[neutral]}
        scroll
      />
    </Row>
  );
}

function solidSwatch(solid: string, fill: string, tone: string) {
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
  fallback: string,
  buttons: { label: ReactNode; value: string }[],
  defaultValue: string,
) {
  return function SegmentedRow({ label = fallback, ...rest }: StyleRowProps) {
    const { value, set, mounted } = useStylePanel();
    return (
      <Row label={label} {...rest}>
        <SegmentedControl
          maxWidth={22}
          minWidth={0}
          onChange={(next) => set({ [key]: next } as Partial<StylePanelValue>)}
          value={mounted ? (value[key] as string | undefined) : undefined}
          defaultValue={defaultValue}
          buttons={buttons.map((button) => ({ size: "l" as const, ...button }))}
        />
      </Row>
    );
  };
}

const SolidRow = segmentedRow(
  "solid",
  "Style",
  [
    { label: solidSwatch("color", "brand-weak", "Color"), value: "color" },
    { label: solidSwatch("inverse", "brand-strong", "Inverse"), value: "inverse" },
    { label: solidSwatch("contrast", "brand-strong", "Contrast"), value: "contrast" },
  ],
  "contrast",
);

const EffectRow = segmentedRow(
  "solidStyle",
  "Effect",
  [
    { label: solidSwatch("", "brand-weak", "Flat"), value: "flat" },
    { label: solidSwatch("", "brand-weak", "Plastic"), value: "plastic" },
  ],
  "flat",
);

const SurfaceRow = segmentedRow(
  "surface",
  "Surface",
  [
    { label: "Filled", value: "filled" },
    { label: "Translucent", value: "translucent" },
  ],
  "filled",
);

const ScalingRow = segmentedRow(
  "scaling",
  "Scaling",
  ["90", "95", "100", "105", "110"].map((size) => ({ label: size, value: size })),
  "100",
);

const TransitionRow = segmentedRow(
  "transition",
  "Transition",
  [
    { label: "All", value: "all" },
    { label: "Micro", value: "micro" },
    { label: "Macro", value: "macro" },
    { label: "None", value: "none" },
  ],
  "all",
);

const BodySizeRow = segmentedRow(
  "bodySize",
  "Text size",
  ["90", "95", "100", "105", "110"].map((size) => ({ label: size, value: size })),
  "100",
);

const BodyLineHeightRow = segmentedRow(
  "bodyLineHeight",
  "Line height",
  ["90", "100", "110", "120"].map((height) => ({ label: height, value: height })),
  "100",
);

const dataStyleButtons = [
  { size: "l" as const, label: "Categorical", value: "categorical" },
  { size: "l" as const, label: "Divergent", value: "divergent" },
  { size: "l" as const, label: "Sequential", value: "sequential" },
];

/** Split out so that only this row depends on DataThemeProvider — every other
 *  section can be cherry-picked without one in the tree. */
function BoundDataStyleControl() {
  const { mode, setChartOptions } = useDataTheme();
  return (
    <SegmentedControl
      maxWidth={22}
      minWidth={0}
      onChange={(next) => setChartOptions({ mode: next as ChartMode })}
      value={mode}
      defaultValue="categorical"
      buttons={dataStyleButtons}
    />
  );
}

function DataStyleRow({ label = "Data Style", ...rest }: StyleRowProps) {
  const { value, set, mounted, controlled } = useStylePanel();
  return (
    <Row label={label} {...rest}>
      {controlled ? (
        <SegmentedControl
          maxWidth={22}
          minWidth={0}
          onChange={(next) => set({ chartMode: next as ChartMode })}
          value={mounted ? value.chartMode : undefined}
          defaultValue="categorical"
          buttons={dataStyleButtons}
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

function PageGroup({
  title = "Page",
  description = "Customize page theme",
  rows,
  ...rest
}: GroupProps<"theme" | "shape">) {
  return (
    <Group title={title} description={description} {...rest}>
      {show(rows, "theme") && <ThemeRow />}
      {show(rows, "shape") && <ShapeRow />}
    </Group>
  );
}

function ColorGroup({
  title = "Color",
  description = "Customize color schemes",
  rows,
  ...rest
}: GroupProps<"brand" | "accent" | "neutral">) {
  return (
    <Group title={title} description={description} {...rest}>
      {show(rows, "brand") && <BrandRow />}
      {show(rows, "accent") && <AccentRow />}
      {show(rows, "neutral") && <NeutralRow />}
    </Group>
  );
}

function SolidStyleGroup({
  title = "Solid style",
  description = "Customize the appearance of interactive elements",
  rows,
  ...rest
}: GroupProps<"solid" | "effect">) {
  return (
    <Group title={title} description={description} {...rest}>
      {show(rows, "solid") && <SolidRow />}
      {show(rows, "effect") && <EffectRow />}
    </Group>
  );
}

function BodyTextGroup({
  title = "Body text",
  description = "Scale running text without touching headings",
  rows,
  ...rest
}: GroupProps<"size" | "lineHeight">) {
  return (
    <Group title={title} description={description} {...rest}>
      {show(rows, "size") && <BodySizeRow />}
      {show(rows, "lineHeight") && <BodyLineHeightRow />}
    </Group>
  );
}

function AdvancedGroup({
  title = "Advanced",
  description = "Customize advanced styling options",
  rows,
  ...rest
}: GroupProps<"surface" | "scaling" | "dataStyle" | "transition">) {
  return (
    <Group title={title} description={description} {...rest}>
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
