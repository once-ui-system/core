import type { DateRange } from "../../components/DatePicker";
import type { FlexElementProps } from "../../interfaces";
import type { ColorValue, TShirtSizes } from "../../types";

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
type ChartMode = "categorical" | "divergent" | "sequential";
type BarWidth = TShirtSizes | "fill" | number;
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

/** One series: the row key it plots (`"revenue"`), and an optional colour. */
interface SeriesConfig<T = DataPoint> {
  key: SeriesKey<T>;
  color?: ColorValue;
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
  onChange?: (range: DateRange) => void;
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
  data: T[];
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
  curveType,
  DataPoint,
  DateConfig,
  PresetsConfig,
  SeriesConfig,
  SeriesKey,
};
