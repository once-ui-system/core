"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import { formatDate } from "./utils/formatDate";
import {
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  YAxis as RechartsYAxis,
  XAxis as RechartsXAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  Legend as RechartsLegend,
} from "recharts";
import { Column, Row, DateRange } from "../../components";
import {
  LinearGradient,
  ChartHeader,
  DataTooltip,
  Legend,
  SeriesConfig,
  ChartProps,
  ChartStatus,
  ChartVariant,
  curveType,
} from ".";
import { RadiusSize, schemes } from "../../types";
import { getDistributedColor } from "./utils/colorDistribution";
import { useDataTheme } from "../../contexts/DataThemeProvider";

interface LineChartProps extends ChartProps {
  curve?: curveType;
  reverseY?: boolean;
  reverseX?: boolean;
  "data-viz-style"?: string;
}

const LineChart: React.FC<LineChartProps> = ({
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
  legend: legendProp = {},
  axis = "both",
  grid = "both",
  border = "neutral-alpha-weak",
  variant: variantProp,
  curve = "natural",
  reverseY = false,
  reverseX = false,
  "data-viz-style": dataVizStyle,
  ...flex
}) => {
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

  const seriesArray = Array.isArray(series) ? series : series ? [series] : [];
  const seriesKeys = seriesArray.map((s: SeriesConfig) => s.key);

  // Generate a unique ID for this chart instance
  const chartId = React.useMemo(() => Math.random().toString(36).substring(2, 9), []);

  const coloredSeriesArray = useMemo(
    () =>
      seriesArray.map((s, index) => ({
        ...s,
        color: s.color || getDistributedColor(index, seriesArray.length),
      })),
    [seriesArray],
  );

  const autoKeys = Object.keys(data[0] || {}).filter((key) => !seriesKeys.includes(key));
  const autoSeries =
    seriesArray.length > 0
      ? coloredSeriesArray
      : autoKeys.map((key, index) => ({
          key,
          color: getDistributedColor(index, autoKeys.length),
        }));

  const xAxisKey = Object.keys(data[0] || {}).find((key) => !seriesKeys.includes(key)) || "name";

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
      if (date?.onChange) {
        date.onChange(newRange);
      }
    },
    [date],
  );

  const legendContent = useCallback(
    (props: any) => {
      const customPayload = autoSeries.map(({ key, color }, index) => ({
        value: key,
        color: `var(--data-${color || schemes[index % schemes.length]})`,
      }));

      return (
        <Legend
          payload={customPayload}
          labels={axis}
          position={legend.position}
          direction={legend.direction}
          variant={variant as ChartVariant}
        />
      );
    },
    [autoSeries, axis, legend.position, legend.direction, variant],
  );

  const legendWrapperStyle = useMemo(
    () => ({
      position: "absolute" as const,
      top:
        legend.position === "top-center" ||
        legend.position === "top-left" ||
        legend.position === "top-right"
          ? reverseX ? 32 : 0
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

  return (
    <Column
      fillWidth
      height={height}
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
      <Row fill borderTop={(title || description || date?.selector) ? (border || "neutral-alpha-weak") : undefined} topRadius={flex.radius as RadiusSize || "l"} overflow="hidden">
        <ChartStatus
          loading={loading}
          empty={!filteredData || filteredData.length === 0}
          emptyState={emptyState}
          error={error}
          errorState={errorState}
        />
        {!loading && !error && filteredData && filteredData.length > 0 && (
          <RechartsResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart
              data={filteredData}
              margin={{ left: 0, bottom: 0, top: 0, right: 0 }}
            >
              <defs>
                {autoSeries.map(({ key, color }, index) => {
                  const colorValue = color || schemes[index % schemes.length];
                  const lineColor = `var(--data-${colorValue})`;
                  return (
                    <LinearGradient
                      key={`gradient-${chartId}-${index}`}
                      id={`barGradient${chartId}${index}`}
                      variant={variant as ChartVariant}
                      color={lineColor}
                    />
                  );
                })}
              </defs>
              <RechartsCartesianGrid vertical={grid === "x" || grid === "both"} horizontal={grid === "y" || grid === "both"} stroke="var(--neutral-alpha-weak)" />
              {legend.display && (
                <RechartsLegend
                  content={legendContent}
                  wrapperStyle={legendWrapperStyle}
                />
              )}
              <RechartsXAxis
                height={32}
                tickMargin={6}
                dataKey={xAxisKey}
                hide={!(axis === "x" || axis === "both")}
                orientation={reverseX ? "top" : "bottom"}
                axisLine={{
                  stroke: axisLineStroke,
                }}
                tickLine={tickLine}
                tick={{
                  fill: tickFill,
                  fontSize: tickFontSize,
                }}
                tickFormatter={(value) => {
                  const dataPoint = data.find((item) => item[xAxisKey] === value);
                  return formatDate(value, date, dataPoint);
                }}
              />
              {(axis === "y" || axis === "both") && (
                <RechartsYAxis
                  width={64}
                  padding={{ top: 40 }}
                  allowDataOverflow
                  orientation={reverseY ? "right" : "left"}
                  tickLine={tickLine}
                  tick={{
                    fill: tickFill,
                    fontSize: tickFontSize,
                  }}
                  axisLine={{
                    stroke: axisLineStroke,
                  }}
                />
              )}
              {tooltip && (
                <RechartsTooltip
                  cursor={{
                    stroke: "var(--neutral-border-strong)",
                    strokeWidth: 1,
                  }}
                  content={(props) => (
                    <DataTooltip {...props} variant={variant as ChartVariant} date={date} />
                  )}
                />
              )}
              {autoSeries.map(({ key, color }, index) => {
                const colorValue = color || schemes[index % schemes.length];
                const lineColor = `var(--data-${colorValue})`;
                return (
                  <RechartsArea
                    key={key}
                    type={curve}
                    dataKey={key}
                    name={key}
                    stroke={lineColor}
                    transform="translate(0, -1)"
                    fill={
                      variant === "outline" ? "transparent" : `url(#barGradient${chartId}${index})`
                    }
                    activeDot={{
                      r: 4,
                      fill: lineColor,
                      stroke: "var(--background)",
                      strokeWidth: 0,
                    }}
                  />
                );
              })}
            </RechartsAreaChart>
          </RechartsResponsiveContainer>
        )}
      </Row>
    </Column>
  );
};

LineChart.displayName = "LineChart";

export { LineChart };
export type { LineChartProps };
