"use client";

import { isWithinInterval, parseISO } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Column } from "../../components/Column";
import { DateRange } from "../../components/DateRangePicker";
import { Row } from "../../components/Row";
import { useDataTheme } from "../../contexts/DataThemeProvider";
import type { DataStyle } from "../../contexts/ThemeProvider";
import { cssColor } from "../../internal/cssColor";
import { RadiusSize, schemes } from "../../types";
import { ChartHeader } from "./ChartHeader";
import { ChartStatus } from "./ChartStatus";
import { DataTooltip } from "./DataTooltip";
import { LinearGradient } from "./Gradient";
import { ChartProps, ChartVariant, curveType, SeriesConfig } from "./interfaces";
import { Legend } from "./Legend";
import { getRechartsComponents } from "./rechartsLoader";
import { getDistributedColor } from "./utils/colorDistribution";
import { formatDate } from "./utils/formatDate";

export interface LineChartProps extends ChartProps {
  curve?: curveType;
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
  animation = true,
  animationBegin,
  animationDuration,
  animationEasing,
  xAxisType,
  xDomain,
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

  const seriesArray = Array.isArray(series) ? series : series ? [series] : [];
  const seriesKeys = seriesArray.map((s: SeriesConfig) => s.key);

  // Generate a unique ID for this chart instance
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
        color: cssColor(color || schemes[index % schemes.length], "data-"),
      }));

      return (
        <Legend
          payload={customPayload}
          reverseY={reverseY}
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
              AreaChart,
              Area,
              XAxis,
              YAxis,
              CartesianGrid,
              Tooltip,
              Legend: RLegend,
            } = rc;
            return (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ left: 0, bottom: 0, top: 0, right: 0 }}>
                  <defs>
                    {autoSeries.map(({ key, color }, index) => {
                      const colorValue = color || schemes[index % schemes.length];
                      const lineColor = cssColor(colorValue, "data-");
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
                    {...(xAxisType ? { type: xAxisType } : {})}
                    {...(xDomain ? { domain: xDomain as any } : {})}
                    hide={!(axis === "x" || axis === "both")}
                    orientation={reverseX ? "top" : "bottom"}
                    axisLine={{ stroke: axisLineStroke }}
                    tickLine={tickLine}
                    tick={{ fill: tickFill, fontSize: tickFontSize }}
                    tickFormatter={(value: any) => {
                      const dataPoint = data.find((item) => item[xAxisKey] === value);
                      return formatDate(value, date, dataPoint);
                    }}
                  />
                  {(axis === "y" || axis === "both") && (
                    <YAxis
                      width={64}
                      padding={{ top: 40 }}
                      allowDataOverflow
                      orientation={reverseY ? "right" : "left"}
                      tickLine={tickLine}
                      tick={{ fill: tickFill, fontSize: tickFontSize }}
                      axisLine={{ stroke: axisLineStroke }}
                    />
                  )}
                  {tooltip && (
                    <Tooltip
                      cursor={{ stroke: "var(--neutral-border-strong)", strokeWidth: 1 }}
                      content={(props: any) => (
                        <DataTooltip {...props} variant={variant as ChartVariant} date={date} />
                      )}
                    />
                  )}
                  {autoSeries.map(({ key, color }, index) => {
                    const colorValue = color || schemes[index % schemes.length];
                    const lineColor = cssColor(colorValue, "data-");
                    return (
                      <Area
                        key={key}
                        type={curve}
                        dataKey={key}
                        name={key}
                        isAnimationActive={animation}
                        animationBegin={animationBegin}
                        animationDuration={animationDuration}
                        animationEasing={animationEasing as any}
                        stroke={lineColor}
                        transform="translate(0, -1)"
                        fill={
                          variant === "outline"
                            ? "transparent"
                            : `url(#barGradient${chartId}${index})`
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
                </AreaChart>
              </ResponsiveContainer>
            );
          })()}
      </Row>
    </Column>
  );
};

LineChart.displayName = "LineChart";

export default LineChart;
