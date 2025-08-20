import { Flex, DateRange } from "../../components";
import { TShirtSizes } from "../../types";
import { CurveType } from "recharts/types/shape/Curve";

type ChartVariant = "flat" | "gradient" | "outline";
type ChartMode = "categorical" | "divergent" | "sequential";
type barWidth = TShirtSizes | "fill" | number;
type curveType = CurveType;

interface DataPoint {
  [key: string]: string | number | Date | undefined;
  label?: string;
}

interface SeriesConfig {
  key: string;
  color?: string;
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

interface legendConfig {
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

interface ChartProps extends Omit<React.ComponentProps<typeof Flex>, "title" | "description"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  series: SeriesConfig | SeriesConfig[];
  data: DataPoint[];
  legend?: legendConfig;
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
  DataPoint,
  SeriesConfig,
  DateConfig,
  PresetsConfig,
  ChartProps,
  ChartVariant,
  barWidth,
  curveType,
  ChartMode,
};
