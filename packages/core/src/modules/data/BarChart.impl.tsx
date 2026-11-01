"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Column } from "../../components/Column.js";
import type { DateRange } from "../../components/DatePicker.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { DataStyle } from "../../contexts/ThemeProvider.js";
import type { SizeProps } from "../../interfaces.js";
import { cssColor } from "../../internal/cssColor.js";
import type { RadiusSize } from "../../types.js";
import { CartesianPlot } from "./CartesianPlot.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartPlot } from "./ChartPlot.js";
import { ChartStatus } from "./ChartStatus.js";
import type { BarWidth, ChartProps, ChartVariant, DataPoint } from "./interfaces.js";
import { chartFormatters, chartSeries, valueAxisWidth } from "./utils/chartSeries.js";
import { formatDate } from "./utils/formatDate.js";

/** Where horizontal bars' category names start, from the card's left edge. */
const CATEGORY_INSET = 20;

/** `barWidth` in px. */
const BAR_SIZES = { xs: 12, s: 16, m: 24, l: 40, xl: 64 } as const;

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
  const { variant: themeVariant, mode, height } = useDataTheme();
  const variant = variantProp || themeVariant;
  const legend = {
    display: legendProp.display !== undefined ? legendProp.display : true,
    position: legendProp.position || "top-left",
    direction: legendProp.direction,
  };
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
      <ChartPlot
        data={filteredData}
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
        {!loading && !error && filteredData && filteredData.length > 0 && (
          <CartesianPlot
            id={chartId}
            rows={filteredData}
            xKey={xAxisKey}
            series={autoSeries.map((s, index) => ({
              key: s.key,
              label: s.label,
              color: barColors[index],
              kind: "bar",
            }))}
            variant={variant as ChartVariant}
            axis={axis}
            grid={grid}
            legend={legend}
            tooltip={tooltip}
            date={date}
            format={format}
            axisWidth={axisWidth}
            categoryWidth={categoryWidth}
            categoryInset={CATEGORY_INSET}
            stack={stack}
            horizontal={horizontal}
            reverseX={reverseX}
            reverseY={reverseY}
            barSize={
              barWidth === "fill"
                ? "fill"
                : typeof barWidth === "number"
                  ? barWidth
                  : BAR_SIZES[barWidth]
            }
            barRadius={(outer) => {
              const r = barWidth === "fill" || barWidth === "xl" ? 10 : 6;
              if (!stack) return [r, r, r, r];
              // A stack rounds only its outer end: the last series.
              if (!outer) return [0, 0, 0, 0];
              return horizontal ? [0, r, r, 0] : [r, r, 0, 0];
            }}
            categoryAxisLine={false}
            xAxisHeight={30}
            xTickMargin={2}
            cursor={hover ? "band" : "none"}
          />
        )}
      </ChartPlot>
    </Column>
  );
};

BarChart.displayName = "BarChart";

export default BarChart;
