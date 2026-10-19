import { useState } from "react";
import Svg, { Circle, Defs, Line, LinearGradient, Path } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import { Axes, ChartFrame, plotRect, TapLayer } from "./ChartFrame";
import { useDataColor } from "./colors";
import { DataTooltip } from "./DataTooltip";
import type { ChartProps, CurveType } from "./interfaces";
import { gradientStops, useGradientId } from "./Swatch";
import {
  curvePath,
  describeValue,
  extent,
  filterByDate,
  formatLabel,
  formatNumber,
  linearScale,
  niceTicks,
  resolveSeries,
} from "./scale";

export interface LineChartProps extends ChartProps {
  /** How the line runs between points, as d3's curves: `natural` by default. */
  curve?: CurveType;
  /**
   * `number` places rows by their x value instead of evenly, over `xDomain`
   * (the values' range by default).
   */
  xAxisType?: "number" | "category";
  xDomain?: [number, number];
}

/**
 * Core's `LineChart`: a line per series over the rows of `data`, with the
 * area under it filled by `variant`, on a card with a header, a legend and
 * tick labels. Drawn with react-native-svg at the width `onLayout` reports;
 * tap a row for its values.
 */
export function LineChart({
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
  grid = "both",
  variant = "gradient",
  curve = "natural",
  xAxisType = "category",
  xDomain,
  "data-viz-style": mode,
  ...flex
}: LineChartProps) {
  const theme = useTheme();
  const toColor = useDataColor(mode);
  const gradientId = useGradientId("line");
  const [selected, setSelected] = useState<number | null>(null);
  const resolved = resolveSeries(data, series);
  const rows = filterByDate(data, resolved.xKey, date);
  const lines = resolved.series.map((s) => ({ key: s.key, color: toColor(s.color) }));
  const ticks = niceTicks(
    ...extent(
      rows,
      lines.map((l) => l.key),
    ),
  );
  const labels = rows.map((row, i) =>
    xAxisType === "number"
      ? String(row[resolved.xKey] ?? i)
      : formatLabel(row, resolved.xKey, date),
  );
  const numericX = rows.map((row, i) => {
    const v = row[resolved.xKey];
    return typeof v === "number" ? v : i;
  });

  return (
    <ChartFrame
      title={title}
      description={description}
      legend={legend}
      legendItems={lines.map((l) => ({ value: l.key, color: l.color }))}
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
        const right = rect.left + rect.width;
        // Recharts' point scale: the first row on the left edge, the last on the right.
        const x =
          xAxisType === "number"
            ? linearScale(xDomain ?? [Math.min(...numericX), Math.max(...numericX)], [
                rect.left,
                right,
              ])
            : (i: number) =>
                rows.length === 1
                  ? rect.left + rect.width / 2
                  : rect.left + (i * rect.width) / (rows.length - 1);
        const xs = rows.map((_, i) => x(xAxisType === "number" ? numericX[i] : i));
        const zero = y(Math.max(ticks[0], Math.min(0, ticks[ticks.length - 1])));
        // Rows without a number for a series are skipped, joining their neighbours.
        const shapes = lines.map((l) => {
          const points = rows.flatMap((row, i) => {
            const v = row[l.key];
            return typeof v === "number" && Number.isFinite(v)
              ? [[xs[i], y(v)] as [number, number]]
              : [];
          });
          return { ...l, points, line: curvePath(points, curve) };
        });
        return (
          <>
            <Svg width={width} height={height}>
              <Defs>
                {lines.map((l, i) => (
                  <LinearGradient key={l.key} id={`${gradientId}${i}`} x1="0" y1="0" x2="0" y2="1">
                    {gradientStops(l.color, variant)}
                  </LinearGradient>
                ))}
              </Defs>
              <Axes
                rect={rect}
                axis={axis}
                grid={grid}
                yTicks={ticks.map((t) => ({ y: y(t), label: formatNumber(t) }))}
                xTicks={xs.map((px, i) => ({ x: px, label: labels[i] }))}
                xAxisLine
              />
              {selected !== null && xs[selected] !== undefined && (
                <Line
                  x1={xs[selected]}
                  x2={xs[selected]}
                  y1={rect.top}
                  y2={rect.top + rect.height}
                  stroke={theme.color("neutral-border-strong")}
                  strokeWidth={1}
                />
              )}
              {shapes.map(({ key, points, line }, s) => {
                if (points.length === 0) return null;
                const first = points[0][0];
                const last = points[points.length - 1][0];
                return (
                  <Path
                    key={key}
                    testID={`area-${key}`}
                    d={`${line}L${last},${zero}L${first},${zero}Z`}
                    fill={variant === "outline" ? "none" : `url(#${gradientId}${s})`}
                  />
                );
              })}
              {shapes.map(({ key, color, points, line }) =>
                points.length === 0 ? null : (
                  <Path
                    key={key}
                    testID={`line-${key}`}
                    d={line}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                  />
                ),
              )}
              {selected !== null &&
                rows[selected] &&
                lines.map((l) => {
                  const v = rows[selected][l.key];
                  if (typeof v !== "number" || !Number.isFinite(v)) return null;
                  return (
                    <Circle
                      key={l.key}
                      testID={`point-${l.key}-${selected}`}
                      cx={xs[selected]}
                      cy={y(v)}
                      r={4}
                      fill={l.color}
                    />
                  );
                })}
            </Svg>
            {tooltip && (
              <TapLayer
                width={width}
                rect={rect}
                xs={xs}
                labels={rows.map(
                  (row, i) =>
                    `${labels[i]}: ${lines.map((l) => `${l.key} ${describeValue(row[l.key])}`).join(", ")}`,
                )}
                selected={selected !== null && selected < rows.length ? selected : null}
                onSelect={setSelected}
                tooltip={
                  selected !== null &&
                  rows[selected] && (
                    <DataTooltip
                      label={labels[selected]}
                      variant={variant}
                      payload={lines.map((l) => ({
                        name: l.key,
                        color: l.color,
                        value: rows[selected][l.key],
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
