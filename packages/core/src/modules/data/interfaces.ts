import type { DateRange } from "../../components/DatePicker.js";
import type { FlexElementProps } from "../../interfaces.js";
import type { ColorValue, TShirtSizes } from "../../types.js";

/**
 * Recharts' own CurveType, inlined.
 *
 * Importing it left `recharts` in core's published .d.ts, so anyone who did
 * not install the optional peer failed to typecheck even when their bundle
 * never touched a chart. The interpolation names are a stable part of d3's
 * shape API; the CurveFactory arm of recharts' union is deliberately dropped,
 * as passing a factory was never part of this component's surface.
 */
type CurveType =
  | "basis"
  | "basisClosed"
  | "basisOpen"
  | "bumpX"
  | "bumpY"
  | "bump"
  | "linear"
  | "linearClosed"
  | "natural"
  | "monotoneX"
  | "monotoneY"
  | "monotone"
  | "step"
  | "stepBefore"
  | "stepAfter";

type ChartVariant = "flat" | "gradient" | "outline";

/**
 * How a chart writes its numbers: on the value axis, in the tooltip and in
 * the summary screen readers hear. Always in the chart's `locale`.
 *
 * - `"number"`: grouped digits (`12,400`; `12 400` in `hu-HU`). The default.
 * - `"compact"`: `12.4K`, `1.2M`.
 * - `"percent"`: a fraction as a percentage (`0.42` is `42%`).
 * - `Intl.NumberFormatOptions`: anything Intl writes, such as
 *   `{ style: "currency", currency: "HUF" }` or `{ style: "unit", unit: "kilogram" }`.
 * - A function, for anything else.
 */
type ValueFormat =
  | "number"
  | "compact"
  | "percent"
  | Intl.NumberFormatOptions
  | ((value: number) => string);
type ChartMode = "categorical" | "divergent" | "sequential";
type BarWidth = TShirtSizes | "fill" | number;
/** @deprecated Use `CurveType`. */
type curveType = CurveType;

/**
 * A row of chart data when no row type is given: a label on the x axis and a
 * value per series. Charts take your own row type too — `data: T[]` — so an
 * `interface RevenueRow { month: string; revenue: number }` needs no cast.
 */
interface DataPoint {
  [key: string]: string | number | Date | undefined;
  label?: string;
}

/** The string keys of a row type: what a series can plot. */
type SeriesKey<T> = Extract<keyof T, string>;

/**
 * One series: the row key it plots (`"revenue"`), and optionally the name the
 * legend and tooltip show, its colour and how its values are written.
 */
interface SeriesConfig<T = DataPoint> {
  key: SeriesKey<T>;
  /** The name shown in the legend and tooltip. Defaults to `key`. */
  label?: string;
  color?: ColorValue;
  /** How this series' values are written in the tooltip; defaults to the chart's `valueFormat`. */
  format?: ValueFormat;
}

interface PresetsConfig {
  display: boolean;
  granularity: "year" | "month" | "week";
}

interface DateConfig {
  start?: Date;
  end?: Date;
  max?: Date;
  min?: Date;
  dual?: boolean;
  format?: string;
  presets?: PresetsConfig;
  selector?: boolean;
  /** Called with the range the reader picks in the header's date picker. */
  onRangeChange?: (range: DateRange) => void;
}

interface LegendConfig {
  display?: boolean;
  direction?: "row" | "column";
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

/**
 * What every chart takes. `T` is the row type, inferred from `data`: `series`
 * keys are checked against it, so a typo in a key is a type error.
 */
interface ChartProps<T extends object = DataPoint>
  extends Omit<FlexElementProps, "title" | "description"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  series: SeriesConfig<T> | SeriesConfig<T>[];
  /**
   * One object per point: the x-axis value and a number per series key.
   * Rows typed with an `interface` (`RevenuePoint[]`) and `readonly` arrays
   * are taken as they are.
   */
  data: readonly T[];
  /**
   * The row key on the x axis (or the category axis of horizontal bars, the
   * slice names of a pie). Without it, the first key of the first row that
   * is not a series.
   */
  xKey?: SeriesKey<T>;
  /** How values are written on the axis, in the tooltip and in the summary. */
  valueFormat?: ValueFormat;
  /**
   * The BCP 47 locale numbers are written in (`"hu-HU"`). Defaults to
   * `"en-US"`, the same on the server and in every browser.
   */
  locale?: string;
  /**
   * What a screen reader hears for the plot, after the title. Without it the
   * chart writes one from its data: the series, the x range and each series'
   * highest and lowest point (`"Revenue and Cost, Jan to Dec. Revenue: highest
   * 12,400 in Aug, lowest 3,100 in Feb."`), in `valueFormat` and `locale`.
   */
  summary?: string;
  /**
   * The plot's whole accessible name, title included, in place of the title
   * and summary. The data table screen readers can walk stays either way.
   */
  "aria-label"?: string;
  legend?: LegendConfig;
  date?: DateConfig;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  error?: boolean;
  tooltip?: boolean;
  grid?: "x" | "y" | "both" | "none";
  axis?: "x" | "y" | "both" | "none";
  variant?: ChartVariant;
  loading?: boolean;
}

export type {
  BarWidth,
  ChartMode,
  ChartProps,
  ChartVariant,
  CurveType,
  curveType,
  DataPoint,
  DateConfig,
  PresetsConfig,
  SeriesConfig,
  SeriesKey,
  ValueFormat,
};
