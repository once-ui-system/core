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
import { getDistributedColor } from "./utils/colorDistribution.js";
import { formatDate } from "./utils/formatDate.js";

export interface BarChartProps<T extends object = DataPoint> extends ChartProps<T> {
  barWidth?: BarWidth;
  hover?: boolean;
  reverseY?: boolean;
  reverseX?: boolean;
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
      if (date?.onChange) {
        date.onChange(newRange);
      }
    },
    [date],
  );

  const seriesArray = Array.isArray(series) ? series : series ? [series] : [];
  const seriesKeys = seriesArray.map((s) => s.key);
  // useId, not Math.random: the server and the client must agree on the
  // gradient ids or hydration reports an attribute mismatch.
  const chartId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const coloredSeriesArray = useMemo(
    () =>
      seriesArray.map((s, index) => ({
        ...s,
        color: s.color || getDistributedColor(index, seriesArray.length),
      })),
    [seriesArray],
  );

  const xAxisKey = Object.keys(data[0] || {}).find((key) => !seriesKeys.includes(key)) || "name";

  const autoKeys = Object.keys(data[0] || {}).filter((key) => key !== xAxisKey);
  const autoSeries =
    seriesArray.length > 0
      ? coloredSeriesArray
      : autoKeys.map((key, index) => ({
          key,
          color: getDistributedColor(index, autoKeys.length),
        }));

  const barColors = autoSeries.map((s) => cssColor(s.color, "data-"));

  const legendContent = useCallback(
    (props: any) => {
      const customPayload = autoSeries.map((series, index) => ({
        value: series.key,
        color: barColors[index],
      }));

      return (
        <Legend
          variant={variant as ChartVariant}
          payload={customPayload}
          labels={axis}
          position={legend.position}
          direction={legend.direction}
        />
      );
    },
    [autoSeries, barColors, variant, axis, legend.position, legend.direction],
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
                >
                  <CartesianGrid
                    vertical={grid === "x" || grid === "both"}
                    horizontal={grid === "y" || grid === "both"}
                    stroke="var(--neutral-alpha-weak)"
                  />
                  {legend.display && (
                    <RLegend content={legendContent} wrapperStyle={legendWrapperStyle} />
                  )}
                  <XAxis
                    dataKey={xAxisKey}
                    axisLine={false}
                    tickLine={tickLine}
                    orientation={reverseX ? "top" : "bottom"}
                    tick={
                      axis === "x" || axis === "both"
                        ? { fill: tickFill, fontSize: tickFontSize }
                        : false
                    }
                    tickFormatter={(value: any) => {
                      const dataPoint = data.find((item) => item[xAxisKey] === value);
                      return formatDate(value, date, dataPoint);
                    }}
                    hide={!(axis === "x" || axis === "both")}
                  />
                  {(axis === "y" || axis === "both") && (
                    <YAxis
                      allowDataOverflow
                      width={64}
                      padding={{ top: 40 }}
                      orientation={reverseY ? "right" : "left"}
                      tickLine={tickLine}
                      tick={{ fill: tickFill, fontSize: tickFontSize }}
                      axisLine={{ stroke: axisLineStroke }}
                    />
                  )}
                  {tooltip && (
                    <Tooltip
                      cursor={{
                        fill: hover ? "var(--neutral-alpha-weak)" : "var(--static-transparent)",
                      }}
                      content={(props: any) => (
                        <DataTooltip {...props} date={date} variant={variant as ChartVariant} />
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
                      name={series.key}
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
                      radius={
                        barWidth === "fill" || barWidth === "xl" ? [10, 10, 10, 10] : [6, 6, 6, 6]
                      }
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
