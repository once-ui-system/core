"use client";

import { isWithinInterval, parseISO } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Column } from "../../components/Column.js";
import type { DateRange } from "../../components/DatePicker.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { DataStyle } from "../../contexts/ThemeProvider.js";
import type { SizeProps } from "../../interfaces.js";
import { cssColor } from "../../internal/cssColor.js";
import { type RadiusSize, schemes } from "../../types.js";
import { animationStyle, CartesianPlot } from "./CartesianPlot.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartPlot } from "./ChartPlot.js";
import { ChartStatus } from "./ChartStatus.js";
import type { ChartProps, ChartVariant, CurveType, DataPoint } from "./interfaces.js";
import { chartFormatters, chartSeries, valueAxisWidth } from "./utils/chartSeries.js";

export interface LineChartProps<T extends object = DataPoint> extends ChartProps<T> {
  curve?: CurveType;
  /**
   * Stack the series on each other: `true` sums them, `"percent"` shows each
   * as its share of the total at that point.
   */
  stack?: boolean | "percent";
  reverseY?: boolean;
  reverseX?: boolean;
  animation?: boolean;
  animationBegin?: number;
  animationDuration?: number;
  animationEasing?: unknown;
  xAxisType?: "number" | "category";
  xDomain?: [number, number];
  /**
   * This chart's colour mode, overriding DataThemeProvider's `mode`. Typed as
   * `DataStyle`; any other string still compiles, for 2.0 callers, and draws
   * categorical.
   */
  "data-viz-style"?: DataStyle | (string & {});
}

const LineChart = ({
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
  grid = "both",
  border = "neutral-alpha-weak",
  variant: variantProp,
  curve = "natural",
  reverseY = false,
  reverseX = false,
  animation = true,
  animationBegin,
  animationDuration,
  animationEasing,
  xAxisType,
  xDomain,
  xKey: xKeyProp,
  valueFormat,
  locale,
  stack = false,
  "data-viz-style": dataVizStyle,
  ...flex
}: LineChartProps) => {
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

  // Generate a unique ID for this chart instance
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
            series={autoSeries.map(({ key, label, color }, index) => ({
              key,
              label,
              color: cssColor(String(color || schemes[index % schemes.length]), "data-"),
              kind: "area",
            }))}
            variant={variant as ChartVariant}
            axis={axis}
            grid={grid}
            legend={legend}
            tooltip={tooltip}
            date={date}
            format={format}
            axisWidth={axisWidth}
            stack={stack}
            reverseX={reverseX}
            reverseY={reverseY}
            curve={curve}
            xType={xAxisType}
            xDomain={xDomain}
            animation={animation}
            animationStyle={animationStyle(animationBegin, animationDuration, animationEasing)}
          />
        )}
      </ChartPlot>
    </Column>
  );
};

LineChart.displayName = "LineChart";

export default LineChart;
