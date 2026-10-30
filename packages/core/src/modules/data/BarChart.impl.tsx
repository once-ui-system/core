"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Column } from "../../components/Column.js";
import type { DateRange } from "../../components/DatePicker.js";
import { Row } from "../../components/Row.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { DataStyle } from "../../contexts/ThemeProvider.js";
import type { SizeProps } from "../../interfaces.js";
import { cssColor } from "../../internal/cssColor.js";
import { RadiusSize } from "../../types.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartStatus } from "./ChartStatus.js";
import { DataTooltip } from "./DataTooltip.js";
import { LinearGradient } from "./Gradient.js";
import { BarWidth, ChartProps, ChartVariant, DataPoint } from "./interfaces.js";
import { Legend } from "./Legend.js";
import { getRechartsComponents } from "./rechartsLoader.js";
import { chartFormatters, chartSeries, rowsByX, valueAxisWidth } from "./utils/chartSeries.js";
import { formatDate } from "./utils/formatDate.js";

/** Where horizontal bars' category names start, from the card's left edge. */
const CATEGORY_INSET = 20;

export interface BarChartProps<T extends object = DataPoint> extends ChartProps<T> {
  barWidth?: BarWidth;
  hover?: boolean;
  reverseY?: boolean;
  reverseX?: boolean;
  /** `"horizontal"` lays the bars along the x axis, one row per category. */
  orientation?: "vertical" | "horizontal";
  /**
   * Stack the series on each other: `true` sums them, `"percent"` shows each
   * as its share of the bar.
   */
  stack?: boolean | "percent";
  /**
   * This chart's colour mode, overriding DataThemeProvider's `mode`. Typed as
   * `DataStyle`; any other string still compiles, for 2.0 callers, and draws
   * categorical.
   */
  "data-viz-style"?: DataStyle | (string & {});
}

const BarChart = ({
  title,
  description,
  data: rows,
  series,
  date,
  emptyState,
  errorState,
  error = false,
  loading = false,
  tooltip = true,
  legend: legendProp = {},
  axis = "both",
  grid = "y",
  border = "neutral-alpha-weak",
  variant: variantProp,
  barWidth = "l",
  hover = false,
  reverseY = false,
  reverseX = false,
  orientation = "vertical",
  stack = false,
  xKey: xKeyProp,
  valueFormat,
  locale,
  "data-viz-style": dataVizStyle,
  ...flex
}: BarChartProps) => {
  // `data` takes interface-typed rows too; each row is read by key all the same.
  const data = rows as readonly DataPoint[];
  const {
    variant: themeVariant,
    mode,
    height,
    tick: { fill: tickFill, fontSize: tickFontSize, line: tickLine },
    axis: { stroke: axisLineStroke },
  } = useDataTheme();
  const variant = variantProp || themeVariant;
  const legend = {
    display: legendProp.display !== undefined ? legendProp.display : true,
    position: legendProp.position || "top-left",
    direction: legendProp.direction,
  };
  const [rc, setRc] = useState<any>(null);

  useEffect(() => {
    getRechartsComponents().then(setRc);
  }, []);

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(
    date?.start && date?.end
      ? {
          startDate: date.start,
          endDate: date.end,
        }
      : undefined,
  );

  useEffect(() => {
    if (date?.start && date?.end) {
      setSelectedDateRange({
        startDate: date.start,
        endDate: date.end,
      });
    }
  }, [date?.start, date?.end]);

  const handleDateRangeChange = useCallback(
    (newRange: DateRange) => {
      setSelectedDateRange(newRange);
      date?.onRangeChange?.(newRange);
    },
    [date],
  );

  // useId, not Math.random: the server and the client must agree on the
  // gradient ids or hydration reports an attribute mismatch.
  const chartId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { xKey: xAxisKey, series: autoSeries } = useMemo(
    () => chartSeries(data, series, xKeyProp),
    [data, series, xKeyProp],
  );
  const format = useMemo(
    () => chartFormatters(valueFormat, locale, autoSeries, stack === "percent"),
    [valueFormat, locale, autoSeries, stack],
  );
  const rowsAtX = useMemo(() => rowsByX(data, xAxisKey), [data, xAxisKey]);
  const axisWidth = useMemo(
    () =>
      valueAxisWidth(
        data,
        autoSeries.map((s) => s.key),
        // A percent stack's axis is 0% to 100%, whatever the values.
        stack === "percent" ? undefined : format.axis,
        !!stack && stack !== "percent",
      ),
    [data, autoSeries, format, stack],
  );
  const horizontal = orientation === "horizontal";
  // Horizontal bars write their category names beside the bars: as wide as
  // the longest (6.5px a character at the tick size), within 64 to 200px.
  const categoryWidth = useMemo(() => {
    if (!horizontal) return 64;
    const longest = data.reduce(
      (n, row) => Math.max(n, String(formatDate(row[xAxisKey], date, row) ?? "").length),
      0,
    );
    // The inset before the names and a 12px gap to the bars.
    return Math.min(200, Math.max(64, Math.ceil(longest * 6.5) + CATEGORY_INSET + 12));
  }, [horizontal, data, xAxisKey, date]);

  const barColors = autoSeries.map((s) => cssColor(s.color, "data-"));

  const legendContent = useCallback(
    (props: any) => {
      const customPayload = autoSeries.map((series, index) => ({
        value: series.label,
        color: barColors[index],
      }));

      return (
        <Legend
          axisWidth={horizontal ? categoryWidth : axisWidth}
          variant={variant as ChartVariant}
          payload={customPayload}
          labels={axis}
          position={legend.position}
          direction={legend.direction}
        />
      );
    },
    [autoSeries, barColors, variant, axis, legend.position, legend.direction, horizontal, categoryWidth, axisWidth],
  );

  const legendWrapperStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top:
        legend.position === "top-center" ||
        legend.position === "top-left" ||
        legend.position === "top-right"
          ? reverseX
            ? 32
            : 0
          : undefined,
      bottom:
        legend.position === "bottom-center" ||
        legend.position === "bottom-left" ||
        legend.position === "bottom-right"
          ? 0
          : undefined,
      paddingBottom:
        legend.position === "bottom-center" ||
        legend.position === "bottom-left" ||
        legend.position === "bottom-right"
          ? "var(--static-space-40)"
          : undefined,
      left:
        (axis === "y" || axis === "both") &&
        (legend.position === "top-center" || legend.position === "bottom-center")
          ? "var(--static-space-64)"
          : 0,
      width:
        (axis === "y" || axis === "both") &&
        (legend.position === "top-center" || legend.position === "bottom-center")
          ? "calc(100% - var(--static-space-64))"
          : "100%",
      right: 0,
      margin: 0,
    }),
    [legend.position, reverseX, axis],
  );

  const filteredData = React.useMemo(() => {
    if (!selectedDateRange || !data || data.length === 0) {
      return data;
    }

    return data.filter((item) => {
      try {
        if (!item[xAxisKey] || !selectedDateRange.startDate || !selectedDateRange.endDate) {
          return true;
        }

        const itemDate =
          typeof item[xAxisKey] === "string"
            ? new Date(item[xAxisKey] as string)
            : (item[xAxisKey] as Date);

        return itemDate >= selectedDateRange.startDate && itemDate <= selectedDateRange.endDate;
      } catch (e) {
        return true;
      }
    });
  }, [data, selectedDateRange, xAxisKey]);

  return (
    <Column
      fillWidth
      // The theme height is any CSS length; Flex types its lengths narrower.
      height={height as SizeProps["height"]}
      border={border}
      radius="l"
      data-viz-style={dataVizStyle || mode}
      {...flex}
    >
      <ChartHeader
        title={title}
        description={description}
        dateRange={selectedDateRange}
        date={date}
        onDateRangeChange={handleDateRangeChange}
        presets={date?.presets}
      />
      {/* The plot takes the height the header leaves: `height` sizes the card once. */}
      <Row
        fillWidth
        flex={1}
        borderTop={
          title || description || date?.selector ? border || "neutral-alpha-weak" : undefined
        }
        topRadius={(flex.radius as RadiusSize) || "l"}
        overflow="hidden"
      >
        <ChartStatus
          loading={loading}
          empty={!filteredData || filteredData.length === 0}
          emptyState={emptyState}
          error={error}
          errorState={errorState}
        />
        {!loading &&
          !error &&
          filteredData &&
          filteredData.length > 0 &&
          rc &&
          (() => {
            const {
              ResponsiveContainer,
              BarChart: RBarChart,
              Bar,
              XAxis,
              YAxis,
              CartesianGrid,
              Tooltip,
              Legend: RLegend,
            } = rc;
            return (
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart
                  data={filteredData}
                  margin={{ left: 0, bottom: 0, top: 0, right: 0 }}
                  barGap={4}
                  layout={horizontal ? "vertical" : "horizontal"}
                  {...(stack === "percent" ? { stackOffset: "expand" } : {})}
                >
                  <CartesianGrid
                    vertical={grid === "x" || grid === "both"}
                    horizontal={grid === "y" || grid === "both"}
                    stroke="var(--neutral-alpha-weak)"
                  />
                  {legend.display && (
                    <RLegend content={legendContent} wrapperStyle={legendWrapperStyle} />
                  )}
                  {(() => {
                    // The category axis carries the x key; the value axis the
                    // numbers. Horizontal bars swap which side each is drawn on.
                    const CategoryAxis = horizontal ? YAxis : XAxis;
                    const ValueAxis = horizontal ? XAxis : YAxis;
                    const showCategory = horizontal
                      ? axis === "y" || axis === "both"
                      : axis === "x" || axis === "both";
                    const showValue = horizontal
                      ? axis === "x" || axis === "both"
                      : axis === "y" || axis === "both";
                    return (
                      <>
                        <CategoryAxis
                          dataKey={xAxisKey}
                          type="category"
                          axisLine={false}
                          tickLine={tickLine}
                          {...(horizontal
                            ? {
                                width: categoryWidth,
                                orientation: reverseY ? "right" : "left",
                                // Room for the legend above the first row, as
                                // the value axis leaves it on upright bars.
                                padding: { top: legend.display ? 40 : 0 },
                              }
                            : { orientation: reverseX ? "top" : "bottom" })}
                          tick={
                            !showCategory
                              ? false
                              : horizontal && !reverseY
                                ? // Names start where the title does, in one
                                  // column, rather than ending at the bars.
                                  (tickProps: any) => (
                                    <text
                                      x={CATEGORY_INSET}
                                      y={tickProps.y}
                                      dy="0.355em"
                                      textAnchor="start"
                                      fill={tickFill}
                                      fontSize={tickFontSize}
                                    >
                                      {formatDate(
                                        tickProps.payload.value,
                                        date,
                                        rowsAtX.get(tickProps.payload.value),
                                      )}
                                    </text>
                                  )
                                : { fill: tickFill, fontSize: tickFontSize }
                          }
                          tickFormatter={(value: any) =>
                            formatDate(value, date, rowsAtX.get(value))
                          }
                          hide={!showCategory}
                        />
                        {showValue && (
                          <ValueAxis
                            type="number"
                            allowDataOverflow
                            {...(horizontal
                              ? { height: 32, orientation: reverseX ? "top" : "bottom" }
                              : {
                                  width: axisWidth,
                                  padding: { top: 40 },
                                  orientation: reverseY ? "right" : "left",
                                })}
                            tickLine={tickLine}
                            tick={{ fill: tickFill, fontSize: tickFontSize }}
                            axisLine={{ stroke: axisLineStroke }}
                            {...(format.axis ? { tickFormatter: format.axis } : {})}
                          />
                        )}
                      </>
                    );
                  })()}
                  {tooltip && (
                    <Tooltip
                      cursor={{
                        fill: hover ? "var(--neutral-alpha-weak)" : "var(--static-transparent)",
                      }}
                      content={(props: any) => (
                        <DataTooltip
                          {...props}
                          date={date}
                          variant={variant as ChartVariant}
                          formatValue={format.tooltip}
                        />
                      )}
                    />
                  )}
                  <defs>
                    {barColors.map((color, index) => (
                      <LinearGradient
                        key={`gradient-${chartId}-${index}`}
                        id={`barGradient${chartId}${index}`}
                        color={color}
                        variant={variant as ChartVariant}
                      />
                    ))}
                  </defs>
                  {autoSeries.map((series, index) => (
                    <Bar
                      key={series.key}
                      dataKey={series.key}
                      name={series.label}
                      {...(stack ? { stackId: "stack" } : {})}
                      fill={`url(#barGradient${chartId}${index})`}
                      stroke={barColors[index]}
                      strokeWidth={1}
                      transform="translate(0, -1)"
                      barSize={
                        barWidth === "fill"
                          ? "100%"
                          : barWidth === "xs"
                            ? 12
                            : barWidth === "s"
                              ? 16
                              : barWidth === "m"
                                ? 24
                                : barWidth === "l"
                                  ? 40
                                  : barWidth === "xl"
                                    ? 64
                                    : barWidth
                      }
                      radius={(() => {
                        const r = barWidth === "fill" || barWidth === "xl" ? 10 : 6;
                        if (!stack) return [r, r, r, r];
                        // A stack rounds only its outer end: the last series.
                        if (index < autoSeries.length - 1) return [0, 0, 0, 0];
                        return horizontal ? [0, r, r, 0] : [r, r, 0, 0];
                      })()}
                    />
                  ))}
                </RBarChart>
              </ResponsiveContainer>
            );
          })()}
      </Row>
    </Column>
  );
};

BarChart.displayName = "BarChart";

export default BarChart;
