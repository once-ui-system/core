"use client";

import React, { useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import type { DateRange } from "../../components/DatePicker.js";
import { Row } from "../../components/Row.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { DataStyle } from "../../contexts/ThemeProvider.js";
import type { SizeProps } from "../../interfaces.js";
import type { RadiusSize } from "../../types.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartStatus } from "./ChartStatus.js";
import { ChartProps, ChartVariant, DataPoint, SeriesKey } from "./interfaces.js";
import { PiePlot } from "./PiePlot.js";

import { chartFormatters } from "./utils/chartSeries.js";

export interface PieChartProps<T extends object = DataPoint> extends Omit<ChartProps<T>, "xKey"> {
  /**
   * This chart's colour mode, overriding DataThemeProvider's `mode`. Typed as
   * `DataStyle`; any other string still compiles, for 2.0 callers, and draws
   * categorical.
   */
  "data-viz-style"?: DataStyle | (string & {});
  ring?: { inner: number; outer: number };
  /** The row key that sizes each slice. */
  dataKey?: SeriesKey<T>;
  /** The row key that names each slice. */
  nameKey?: SeriesKey<T>;
  origo?: { x: number; y: number };
}

const PieChart = ({
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
  origo = { x: 50, y: 50 },
  legend: legendProp = {},
  border = "neutral-alpha-weak",
  variant: variantProp,
  ring = { inner: 0, outer: 80 },
  dataKey = "value",
  nameKey = "name",
  valueFormat,
  locale,
  "data-viz-style": dataViz,
  ...flex
}: PieChartProps) => {
  // `data` takes interface-typed rows too; each row is read by key all the same.
  const data = rows as readonly DataPoint[];
  const { variant: themeVariant, mode, height } = useDataTheme();
  const variant = variantProp || themeVariant;
  const legend = {
    display: legendProp.display !== undefined ? legendProp.display : true,
    position: legendProp.position || "bottom-center",
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

  const handleDateRangeChange = (newRange: DateRange) => {
    setSelectedDateRange(newRange);
    date?.onRangeChange?.(newRange);
  };

  const filteredData = React.useMemo(() => {
    if (!selectedDateRange || !data || data.length === 0) {
      return data;
    }

    return data.filter((item) => {
      try {
        if (!item.date || !selectedDateRange.startDate || !selectedDateRange.endDate) {
          return true;
        }

        const itemDate = typeof item.date === "string" ? new Date(item.date) : item.date;

        return itemDate >= selectedDateRange.startDate && itemDate <= selectedDateRange.endDate;
      } catch (e) {
        return true;
      }
    });
  }, [data, selectedDateRange]);

  const format = React.useMemo(
    () => chartFormatters(valueFormat, locale, []),
    [valueFormat, locale],
  );
  // Scoped to this chart: two pies with the same colours on one page used to
  // share gradient ids, so one chart's variant painted the other's slices.
  const chartId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const getGradientId = React.useCallback(
    (colorKey: string | number | Date): string =>
      `pieGradient-${chartId}-${String(colorKey).replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [chartId],
  );

  return (
    <Column
      fillWidth
      // The theme height is any CSS length; Flex types its lengths narrower.
      height={height as SizeProps["height"]}
      data-viz-style={dataViz || mode}
      border={border}
      radius="l"
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
        {!loading && !error && filteredData && filteredData.length > 0 && (
          <PiePlot
            id={chartId}
            rows={filteredData}
            dataKey={dataKey}
            nameKey={nameKey}
            variant={variant as ChartVariant}
            legend={legend}
            tooltip={tooltip}
            date={date}
            formatValue={format.tooltip}
            ring={ring}
            origo={origo}
            gradientId={getGradientId}
          />
        )}
      </Row>
    </Column>
  );
};

PieChart.displayName = "PieChart";

export default PieChart;
