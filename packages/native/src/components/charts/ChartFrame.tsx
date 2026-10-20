import { type ReactNode, useState } from "react";
import { type LayoutChangeEvent, Platform, Pressable, View } from "react-native";
import { G, Line, Text as SvgText } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import { type FlexProps, flexStyle } from "../Flex";
import { ChartHeader } from "./ChartHeader";
import { ChartStatus } from "./ChartStatus";
import type { ChartProps, ChartVariant, LegendConfig } from "./interfaces";
import { Legend } from "./Legend";
import { textWidth } from "./scale";

/** Core's `DataThemeProvider` defaults: 11pt ticks, a 24rem card. */
export const TICK_FONT_SIZE = 11;

export interface ChartFrameProps
  extends Omit<FlexProps, "children">,
    Pick<ChartProps, "title" | "description" | "emptyState" | "errorState" | "error" | "loading"> {
  legend?: LegendConfig;
  legendItems: { value: string; color: string }[];
  variant: ChartVariant;
  empty: boolean;
  /** The plot, once its box is measured. */
  children: (size: { width: number; height: number }) => ReactNode;
}

/**
 * The card every chart draws in, as core's: a bordered `l` column `height`
 * tall (24rem by default) holding the header, the legend and the plot, which
 * takes the height left and is measured with `onLayout` to size the SVG.
 */
export function ChartFrame({
  title,
  description,
  legend = {},
  legendItems,
  variant,
  loading = false,
  error = false,
  empty,
  emptyState,
  errorState,
  children,
  testID,
  ...props
}: ChartFrameProps) {
  const theme = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { style, rest, userStyle, hidden } = flexStyle(theme, {
    direction: "column",
    fillWidth: true,
    height: "24rem",
    radius: "l",
    border: "neutral-alpha-weak",
    overflow: "hidden",
    ...props,
  });
  if (hidden) return null;
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
  };
  const status = loading || error || empty;
  const position = legend.position ?? "top-left";
  const legendNode = legend.display !== false && !status && (
    <Legend
      payload={legendItems}
      direction={legend.direction}
      position={position}
      variant={variant}
    />
  );
  const hasHeader = !!(title || description);
  return (
    <View testID={testID} {...rest} style={[style, userStyle]}>
      <ChartHeader title={title} description={description} />
      <View
        style={{
          flex: 1,
          ...(hasHeader
            ? {
                borderTopWidth: 1,
                borderTopColor: theme.border(props.border ?? "neutral-alpha-weak"),
              }
            : {}),
        }}
      >
        {position.startsWith("top") && legendNode}
        {status ? (
          <ChartStatus
            loading={loading}
            empty={empty}
            error={error}
            emptyState={emptyState}
            errorState={errorState}
          />
        ) : (
          <View testID={`${testID ?? "chart"}-plot`} style={{ flex: 1 }} onLayout={onLayout}>
            {size.width > 0 && size.height > 0 && children(size)}
          </View>
        )}
        {position.startsWith("bottom") && legendNode}
      </View>
    </View>
  );
}

export interface PlotRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The plot inside an SVG `width` × `height`: room on the left for the widest
 * y label, below for the x labels, and a little around for the end points.
 */
export function plotRect(
  width: number,
  height: number,
  axis: ChartProps["axis"],
  yLabels: string[],
): PlotRect {
  const showY = axis === "y" || axis === "both";
  const showX = axis === "x" || axis === "both";
  const labelWidth = Math.max(0, ...yLabels.map((l) => textWidth(l, TICK_FONT_SIZE)));
  const left = showY ? Math.ceil(labelWidth) + 16 : 8;
  const top = 12;
  const bottom = showX ? TICK_FONT_SIZE + 16 : 4;
  return {
    left,
    top,
    width: Math.max(1, width - left - 12),
    height: Math.max(1, height - top - bottom),
  };
}

export interface AxesProps {
  rect: PlotRect;
  axis: NonNullable<ChartProps["axis"]>;
  grid: NonNullable<ChartProps["grid"]>;
  /** The y ticks, in points from the top, with their labels. */
  yTicks: { y: number; label: string }[];
  /** The x positions of the rows, with their labels. */
  xTicks: { x: number; label: string }[];
  /** A line under the plot, as core's LineChart draws its x axis. */
  xAxisLine?: boolean;
}

/** Grid lines and tick labels, as core's charts style recharts' `CartesianGrid` and axes. */
export function Axes({ rect, axis, grid, yTicks, xTicks, xAxisLine = false }: AxesProps) {
  const theme = useTheme();
  const stroke = theme.color("neutral-alpha-weak");
  const fill = theme.color("neutral-on-background-weak");
  // With no theme font, SVG text on the web would fall back to the browser's serif.
  const fontFamily =
    theme.text("label-default-s").fontFamily ?? Platform.select({ web: "system-ui, sans-serif" });
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const showX = axis === "x" || axis === "both";
  const showY = axis === "y" || axis === "both";
  // Every nth x label, so neighbours don't overlap.
  const spacing = xTicks.length > 1 ? Math.abs(xTicks[1].x - xTicks[0].x) : rect.width;
  const widest = Math.max(0, ...xTicks.map((t) => textWidth(t.label, TICK_FONT_SIZE)));
  const every = Math.max(1, Math.ceil((widest + 8) / Math.max(1, spacing)));
  return (
    <G>
      {(grid === "y" || grid === "both") &&
        yTicks.map((t) => (
          <Line
            key={`gy${t.y}`}
            x1={rect.left}
            x2={right}
            y1={t.y}
            y2={t.y}
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
      {(grid === "x" || grid === "both") &&
        xTicks.map((t) => (
          <Line
            key={`gx${t.x}`}
            x1={t.x}
            x2={t.x}
            y1={rect.top}
            y2={bottom}
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
      {showY && <Line x1={rect.left} x2={rect.left} y1={rect.top} y2={bottom} stroke={stroke} />}
      {showX && xAxisLine && (
        <Line x1={rect.left} x2={right} y1={bottom} y2={bottom} stroke={stroke} />
      )}
      {showY &&
        yTicks.map((t) => (
          <SvgText
            key={`ly${t.y}`}
            x={rect.left - 8}
            y={t.y + TICK_FONT_SIZE / 3}
            fill={fill}
            fontSize={TICK_FONT_SIZE}
            fontFamily={fontFamily}
            textAnchor="end"
          >
            {t.label}
          </SvgText>
        ))}
      {showX &&
        xTicks.map((t, i) =>
          i % every === 0 ? (
            <SvgText
              key={`lx${t.x}`}
              x={t.x}
              y={bottom + TICK_FONT_SIZE + 6}
              fill={fill}
              fontSize={TICK_FONT_SIZE}
              fontFamily={fontFamily}
              textAnchor="middle"
            >
              {t.label}
            </SvgText>
          ) : null,
        )}
    </G>
  );
}

export interface TapLayerProps {
  /** The SVG's width, to keep the tooltip inside it. */
  width: number;
  rect: PlotRect;
  /** The x position of each row; each takes taps across its share of the plot. */
  xs: number[];
  /** What a screen reader says for each row. */
  labels: string[];
  selected: number | null;
  onSelect: (index: number | null) => void;
  /** The tooltip for the selected row. */
  tooltip: ReactNode;
}

/**
 * A pressable strip over each row of the plot: tapping one shows its tooltip,
 * tapping it again (or another) hides or moves it. The tap replaces the web's hover.
 */
export function TapLayer({ width, rect, xs, labels, selected, onSelect, tooltip }: TapLayerProps) {
  const bounds = xs.map((x, i) => {
    const from = i === 0 ? rect.left : (xs[i - 1] + x) / 2;
    const to = i === xs.length - 1 ? rect.left + rect.width : (x + xs[i + 1]) / 2;
    return { from, to };
  });
  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      {bounds.map(({ from, to }, i) => (
        <Pressable
          // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id but their place.
          key={i}
          accessibilityRole="button"
          accessibilityLabel={labels[i]}
          accessibilityState={{ selected: selected === i }}
          onPress={() => onSelect(selected === i ? null : i)}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: from,
            width: Math.max(1, to - from),
          }}
        />
      ))}
      {selected !== null && xs[selected] !== undefined && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: rect.top,
            maxWidth: Math.max(160, width * 0.6),
            // Beside the row, on the side with more room.
            ...(xs[selected] < width / 2
              ? { left: xs[selected] + 12 }
              : { right: width - xs[selected] + 12 }),
          }}
        >
          {tooltip}
        </View>
      )}
    </View>
  );
}
