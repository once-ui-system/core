"use client";

import { isWithinInterval, parseISO } from "date-fns";
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
import { BarWidth, ChartProps, ChartVariant, CurveType, DataPoint } from "./interfaces.js";
import { Legend } from "./Legend.js";
import { getRechartsComponents } from "./rechartsLoader.js";
import { chartFormatters, chartSeries, rowsByX, valueAxisWidth } from "./utils/chartSeries.js";
import { formatDate } from "./utils/formatDate.js";

export interface LineBarChartProps<T extends object = DataPoint> extends ChartProps<T> {
  barWidth?: BarWidth;
  curve?: CurveType;
  reverseY?: boolean;
  reverseX?: boolean;
  /**
   * This chart's colour mode, overriding DataThemeProvider's `mode`. Typed as
   * `DataStyle`; any other string still compiles, for 2.0 callers, and draws
   * categorical.
   */
  "data-viz-style"?: DataStyle | (string & {});
}

const LineBarChart = ({
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
  grid = "y",
  axis = "both",
  border = "neutral-alpha-weak",
  variant: variantProp,
  barWidth = "l",
  curve = "natural",
  reverseY = false,
  reverseX = false,
  xKey: xKeyProp,
  valueFormat,
  locale,
  "data-viz-style": dataVizStyle,
  ...flex
}: LineBarChartProps) => {
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

  const { xKey: xAxisKey, series: resolvedSeries } = useMemo(
    () => chartSeries(data, series, xKeyProp),
    [data, series, xKeyProp],
  );
  const format = useMemo(
    () => chartFormatters(valueFormat, locale, resolvedSeries),
    [valueFormat, locale, resolvedSeries],
  );
  const rowsAtX = useMemo(() => rowsByX(data, xAxisKey), [data, xAxisKey]);
  const axisWidth = useMemo(
    () =>
      valueAxisWidth(
        data,
        resolvedSeries.map((s) => s.key),
        // A percent stack's axis is 0% to 100%, whatever the values.
        format.axis,
        false,
      ),
    [data, resolvedSeries, format],
  );

  const filteredData = React.useMemo(() => {
    if (selectedDateRange?.startDate && selectedDateRange?.endDate && xAxisKey) {
      const startDate = selectedDateRange.startDate;
      const endDate = selectedDateRange.endDate;

      if (startDate instanceof Date && endDate instanceof Date) {
        return data.filter((item) => {
          try {
            const itemDateValue = item[xAxisKey];
            if (!itemDateValue) return false;

            const itemDate =
              typeof itemDateValue === "string" ? parseISO(itemDateValue) : (itemDateValue as Date);

            return isWithinInterval(itemDate, {
              start: startDate,
              end: endDate,
            });
          } catch (error) {
            return false;
          }
        });
      }
    }
    return data;
  }, [data, selectedDateRange, xAxisKey]);

  const handleDateRangeChange = useCallback(
    (newRange: DateRange) => {
      setSelectedDateRange(newRange);
      date?.onRangeChange?.(newRange);
    },
    [date],
  );

  const chartSeriesArray = Array.isArray(series) ? series : series ? [series] : [];
  if (chartSeriesArray.length < 2) {
    console.warn("LineBarChart requires at least 2 series (one for line, one for bar)");
  }

  const lineSeries = chartSeriesArray[0] || { key: "value1", color: "blue" };
  const barSeries = chartSeriesArray[1] || { key: "value2", color: "green" };
  const lineLabel = lineSeries.label ?? lineSeries.key;
  const barLabel = barSeries.label ?? barSeries.key;

  const lineColor = lineSeries.color || "blue";
  const barColor = barSeries.color || "green";

  const finalLineColor = cssColor(lineColor, "data-");
  const finalBarColor = cssColor(barColor, "data-");

  const legendContent = useMemo(
    () => (
      <Legend
          axisWidth={axisWidth}
        variant={variant as ChartVariant}
        colors={[finalLineColor, finalBarColor]}
        labels={axis}
        position={legend.position}
        direction={legend.direction}
      />
    ),
    [variant, finalLineColor, finalBarColor, axis, legend.position, legend.direction, axisWidth],
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

  // useId, not Math.random: the server and the client must agree on the
  // gradient ids or hydration reports an attribute mismatch.
  const chartId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

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
              ComposedChart,
              Bar,
              Area,
              XAxis,
              YAxis,
              CartesianGrid,
              Tooltip,
              Legend: RLegend,
            } = rc;
            return (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={filteredData}
                  margin={{ left: 0, bottom: 0, top: 0, right: 0 }}
                  barGap={4}
                >
                  <defs>
                    <LinearGradient
                      id={`barGradient${chartId}`}
                      color={finalBarColor}
                      variant={variant as ChartVariant}
                    />
                    <LinearGradient
                      id={`lineGradient${chartId}`}
                      color={finalLineColor}
                      variant={variant as ChartVariant}
                    />
                  </defs>
                  <CartesianGrid
                    vertical={grid === "x" || grid === "both"}
                    horizontal={grid === "y" || grid === "both"}
                    stroke="var(--neutral-alpha-weak)"
                  />
                  {legend.display && (
                    <RLegend content={legendContent} wrapperStyle={legendWrapperStyle} />
                  )}
                  <XAxis
                    height={32}
                    tickMargin={6}
                    dataKey={xAxisKey}
                    hide={!(axis === "x" || axis === "both")}
                    orientation={reverseX ? "top" : "bottom"}
                    axisLine={{ stroke: axisLineStroke }}
                    tickLine={tickLine}
                    tick={{ fill: tickFill, fontSize: tickFontSize }}
                    tickFormatter={(value: any) => formatDate(value, date, rowsAtX.get(value))}
                  />
                  {(axis === "y" || axis === "both") && (
                    <YAxis
                      width={axisWidth}
                      padding={{ top: 40 }}
                      allowDataOverflow
                      orientation={reverseY ? "right" : "left"}
                      tickLine={tickLine}
                      tick={{ fill: tickFill, fontSize: tickFontSize }}
                      axisLine={{ stroke: axisLineStroke }}
                      {...(format.axis ? { tickFormatter: format.axis } : {})}
                    />
                  )}
                  {tooltip && (
                    <Tooltip
                      cursor={{ stroke: "var(--neutral-border-strong)", strokeWidth: 1 }}
                      content={(props: any) => (
                        <DataTooltip
                          {...props}
                          variant={variant as ChartVariant}
                          date={date}
                          dataKey={xAxisKey}
                          formatValue={format.tooltip}
                        />
                      )}
                    />
                  )}
                  <Area
                    type={curve}
                    dataKey={lineSeries.key}
                    name={lineLabel}
                    stroke={finalLineColor}
                    transform="translate(0, -1)"
                    fill={`url(#lineGradient${chartId})`}
                    activeDot={{
                      r: 4,
                      fill: finalLineColor,
                      stroke: "var(--background)",
                      strokeWidth: 0,
                    }}
                  />
                  <Bar
                    dataKey={barSeries.key}
                    name={barLabel}
                    fill={`url(#barGradient${chartId})`}
                    stroke={finalBarColor}
                    strokeWidth={1}
                    transform="translate(0, -1)"
                    radius={[4, 4, 4, 4]}
                    barSize={
                      barWidth === "fill"
                        ? "100%"
                        : barWidth === "xs"
                          ? 6
                          : barWidth === "s"
                            ? 12
                            : barWidth === "m"
                              ? 20
                              : barWidth === "l"
                                ? 40
                                : barWidth === "xl"
                                  ? 50
                                  : barWidth
                    }
                  />
                </ComposedChart>
              </ResponsiveContainer>
            );
          })()}
      </Row>
    </Column>
  );
};

LineBarChart.displayName = "LineBarChart";

export default LineBarChart;
