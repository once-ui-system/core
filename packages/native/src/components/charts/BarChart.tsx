import { useState } from "react";
import Svg, { Defs, LinearGradient, Rect } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import { Axes, ChartFrame, plotRect, TapLayer } from "./ChartFrame";
import { useDataColor } from "./colors";
import { DataTooltip } from "./DataTooltip";
import type { BarWidth, ChartProps } from "./interfaces";
import { gradientStops, useGradientId } from "./Swatch";
import {
  barSize,
  describeValue,
  extent,
  filterByDate,
  formatLabel,
  formatNumber,
  linearScale,
  niceTicks,
  resolveSeries,
} from "./scale";

export interface BarChartProps extends ChartProps {
  /** `xs` 12, `s` 16, `m` 24, `l` 40, `xl` 64 points, a number, or `fill` for the whole slot. */
  barWidth?: BarWidth;
  /** Shades the tapped row's band, as core shades the hovered one. */
  hover?: boolean;
}

/**
 * Core's `BarChart`: a bar per series for each row of `data`, grouped by the
 * x value, on a card with a header, a legend and tick labels. Drawn with
 * react-native-svg at the width `onLayout` reports; tap a row for its values.
 */
export function BarChart({
  title,
  description,
  data,
  series,
  date,
  emptyState,
  errorState,
  error = false,
  loading = false,
  tooltip = true,
  legend = {},
  axis = "both",
  grid = "y",
  variant = "gradient",
  barWidth = "l",
  hover = false,
  "data-viz-style": mode,
  ...flex
}: BarChartProps) {
  const theme = useTheme();
  const toColor = useDataColor(mode);
  const gradientId = useGradientId("bar");
  const [selected, setSelected] = useState<number | null>(null);
  const resolved = resolveSeries(data, series);
  const rows = filterByDate(data, resolved.xKey, date);
  const bars = resolved.series.map((s) => ({ key: s.key, color: toColor(s.color) }));
  const ticks = niceTicks(
    ...extent(
      rows,
      bars.map((b) => b.key),
    ),
  );
  const labels = rows.map((row) => formatLabel(row, resolved.xKey, date));

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={legend}
      legendItems={bars.map((b) => ({ value: b.key, color: b.color }))}
      variant={variant}
      loading={loading}
      error={error}
      empty={rows.length === 0}
      emptyState={emptyState}
      errorState={errorState}
      {...flex}
    >
      {({ width, height }) => {
        const rect = plotRect(width, height, axis, ticks.map(formatNumber));
        const y = linearScale(
          [ticks[0], ticks[ticks.length - 1]],
          [rect.top + rect.height, rect.top],
        );
        const band = rect.width / rows.length;
        const xs = rows.map((_, i) => rect.left + band * (i + 0.5));
        // Recharts' 10% category gap on each side and 4pt between the bars of a row.
        const room = barWidth === "fill" ? band : band * 0.8;
        const gap = bars.length > 1 ? 4 : 0;
        const bw = barSize(barWidth, (room - gap * (bars.length - 1)) / bars.length);
        const groupWidth = bw * bars.length + gap * (bars.length - 1);
        const corner = barWidth === "fill" || barWidth === "xl" ? 10 : 6;
        const zero = y(Math.max(ticks[0], Math.min(0, ticks[ticks.length - 1])));
        return (
          <>
            <Svg width={width} height={height}>
              <Defs>
                {bars.map((b, i) => (
                  <LinearGradient key={b.key} id={`${gradientId}${i}`} x1="0" y1="0" x2="0" y2="1">
                    {gradientStops(b.color, variant)}
                  </LinearGradient>
                ))}
              </Defs>
              {hover && selected !== null && (
                <Rect
                  x={xs[selected] - band / 2}
                  y={rect.top}
                  width={band}
                  height={rect.height}
                  fill={theme.color("neutral-alpha-weak")}
                />
              )}
              <Axes
                rect={rect}
                axis={axis}
                grid={grid}
                yTicks={ticks.map((t) => ({ y: y(t), label: formatNumber(t) }))}
                xTicks={xs.map((x, i) => ({ x, label: labels[i] }))}
              />
              {rows.map((row, i) =>
                bars.map((b, s) => {
                  const value = row[b.key];
                  if (typeof value !== "number" || !Number.isFinite(value)) return null;
                  const top = Math.min(y(value), zero);
                  const h = Math.abs(zero - y(value));
                  const r = Math.min(corner, bw / 2, h / 2);
                  return (
                    <Rect
                      // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id but their place.
                      key={`${b.key}${i}`}
                      testID={`bar-${b.key}-${i}`}
                      x={xs[i] - groupWidth / 2 + s * (bw + gap) + 0.5}
                      y={top}
                      width={Math.max(0, bw - 1)}
                      height={h}
                      rx={r}
                      ry={r}
                      fill={`url(#${gradientId}${s})`}
                      stroke={b.color}
                      strokeWidth={1}
                    />
                  );
                }),
              )}
            </Svg>
            {tooltip && (
              <TapLayer
                width={width}
                rect={rect}
                xs={xs}
                labels={rows.map(
                  (row, i) =>
                    `${labels[i]}: ${bars.map((b) => `${b.key} ${describeValue(row[b.key])}`).join(", ")}`,
                )}
                selected={selected !== null && selected < rows.length ? selected : null}
                onSelect={setSelected}
                tooltip={
                  selected !== null &&
                  rows[selected] && (
                    <DataTooltip
                      label={labels[selected]}
                      variant={variant}
                      payload={bars.map((b) => ({
                        name: b.key,
                        color: b.color,
                        value: rows[selected][b.key],
                      }))}
                    />
                  )
                }
              />
            )}
          </>
        );
      }}
    </ChartFrame>
  );
}
