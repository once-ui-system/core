"use client";

import { isWithinInterval, parseISO } from "date-fns";
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
import type { BarWidth, ChartProps, ChartVariant, CurveType, DataPoint } from "./interfaces.js";
import { chartFormatters, chartSeries, valueAxisWidth } from "./utils/chartSeries.js";

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

  const { xKey: xAxisKey, series: resolvedSeries } = useMemo(
    () => chartSeries(data, series, xKeyProp),
    [data, series, xKeyProp],
  );
  const format = useMemo(
    () => chartFormatters(valueFormat, locale, resolvedSeries),
    [valueFormat, locale, resolvedSeries],
  );
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
            series={[
              { key: lineSeries.key, label: lineLabel, color: finalLineColor, kind: "area" },
              { key: barSeries.key, label: barLabel, color: finalBarColor, kind: "bar" },
            ]}
            variant={variant as ChartVariant}
            axis={axis}
            grid={grid}
            legend={legend}
            tooltip={tooltip}
            date={date}
            format={format}
            axisWidth={axisWidth}
            reverseX={reverseX}
            reverseY={reverseY}
            curve={curve}
            barSize={
              barWidth === "fill"
                ? "fill"
                : typeof barWidth === "number"
                  ? barWidth
                  : { xs: 6, s: 12, m: 20, l: 40, xl: 50 }[barWidth]
            }
            barRadius={() => [4, 4, 4, 4]}
            tooltipDataKey={xAxisKey}
          />
        )}
      </ChartPlot>
    </Column>
  );
};

LineBarChart.displayName = "LineBarChart";

export default LineBarChart;
