import type { ReactNode } from "react";
import type { TShirtSizes } from "../../types";
import type { FlexProps } from "../Flex";

/**
 * The interpolation names of core's `curveType` (d3's, through recharts).
 * `natural`, `monotone`, `linear`, `step*`, `bump*` and `basis*` are drawn as
 * d3 draws them; the `*Closed`/`*Open` and `Y` forms fall back to their plain one.
 */
export type CurveType =
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

/** Core's lowercase alias. */
export type curveType = CurveType;

export type ChartVariant = "flat" | "gradient" | "outline";
export type ChartMode = "categorical" | "divergent" | "sequential";
export type BarWidth = TShirtSizes | "fill" | number;

/** One row of `data`: the x value under its own key, one number per series. */
export interface DataPoint {
  [key: string]: string | number | Date | undefined;
  /** Shown instead of the x value on the axis and in the tooltip. */
  label?: string;
}

export interface SeriesConfig {
  key: string;
  /** A data colour (`"blue"`, `"emerald"`), any theme colour token, or a raw `#hex`/`rgb()`. */
  color?: string;
}

/**
 * Core's `DateConfig`, without the range picker: `start` and `end` filter the
 * data, `format` writes date x values (`yyyy`, `yy`, `MMMM`, `MMM`, `MM`, `M`,
 * `dd`, `d`, `EEEE`, `EEE`, `HH`, `mm`).
 */
export interface DateConfig {
  start?: Date;
  end?: Date;
  format?: string;
}

export interface LegendConfig {
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

/** Core's `ChartProps`, on native `FlexProps`. */
export interface ChartProps extends FlexProps {
  title?: ReactNode;
  description?: ReactNode;
  series: SeriesConfig | SeriesConfig[];
  data: DataPoint[];
  legend?: LegendConfig;
  date?: DateConfig;
  emptyState?: ReactNode;
  errorState?: ReactNode;
  error?: boolean;
  /** Tap a bar or point to show its values. */
  tooltip?: boolean;
  grid?: "x" | "y" | "both" | "none";
  axis?: "x" | "y" | "both" | "none";
  variant?: ChartVariant;
  loading?: boolean;
  /**
   * This chart's colour mode, as core's `data-viz-style`: `divergent` and
   * `sequential` re-map the data colours as core's stylesheet does.
   */
  "data-viz-style"?: ChartMode | (string & {});
}
