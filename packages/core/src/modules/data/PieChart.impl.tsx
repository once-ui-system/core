"use client";

import React, { useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import type { DateRange } from "../../components/DatePicker.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { DataStyle } from "../../contexts/ThemeProvider.js";
import type { SizeProps } from "../../interfaces.js";
import { cssColor } from "../../internal/cssColor.js";
import { RadiusSize, schemes } from "../../types.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartPlot } from "./ChartPlot.js";
import { ChartStatus } from "./ChartStatus.js";
import { DataTooltip } from "./DataTooltip.js";
import { RadialGradient } from "./Gradient.js";
import { ChartProps, ChartVariant, DataPoint, SeriesKey } from "./interfaces.js";
import { Legend } from "./Legend.js";
import { getRechartsComponents } from "./rechartsLoader.js";

import { chartFormatters } from "./utils/chartSeries.js";
import { getDistributedColor } from "./utils/colorDistribution.js";

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
  const [rc, setRc] = useState<any>(null);

  useEffect(() => {
    getRechartsComponents().then(setRc);
  }, []);

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

  const colorPalette = React.useMemo(() => {
    if (!data || data.length === 0) return schemes.map((c) => cssColor(c, "data-"));

    return Array.from({ length: data.length }, (_, index) => {
      const colorKey = getDistributedColor(index, data.length);
      return cssColor(String(colorKey), "data-");
    });
  }, [data]);

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
        {!loading &&
          !error &&
          filteredData &&
          filteredData.length > 0 &&
          rc &&
          (() => {
            const {
              ResponsiveContainer,
              PieChart: RPieChart,
              Pie,
              Cell,
              Tooltip,
              Legend: RLegend,
            } = rc;
            return (
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <defs>
                    <pattern
                      id="pieChartMasterPattern"
                      patternUnits="userSpaceOnUse"
                      width="100%"
                      height="100%"
                    >
                      <RadialGradient
                        id="pieChartMasterGradient"
                        color="var(--page-background)"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        variant={variant as ChartVariant}
                      />
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#pieChartMasterGradient)"
                      />
                    </pattern>

                    {Array.from(
                      new Set(
                        filteredData.map((entry, index) => {
                          return entry.color || getDistributedColor(index, filteredData.length);
                        }),
                      ),
                    ).map((colorKey) => {
                      const baseColor = cssColor(String(colorKey), "data-");
                      const patternId = getGradientId(colorKey as string);
                      return (
                        <pattern
                          id={patternId}
                          key={`pattern-${colorKey}`}
                          patternUnits="userSpaceOnUse"
                          width="100%"
                          height="100%"
                        >
                          {variant !== "outline" && (
                            <rect x="0" y="0" width="100%" height="100%" fill={baseColor} />
                          )}
                          {variant === "gradient" && (
                            <rect
                              x="0"
                              y="0"
                              width="100%"
                              height="100%"
                              fill="url(#pieChartMasterPattern)"
                            />
                          )}
                        </pattern>
                      );
                    })}
                  </defs>
                  {legend.display && (
                    <RLegend
                      content={(props: any) => (
                        <Legend
                          {...props}
                          variant={variant as ChartVariant}
                          position={legend.position}
                          direction={legend.direction}
                          labels="none"
                          colors={colorPalette}
                        />
                      )}
                      wrapperStyle={{
                        position: "absolute",
                        top:
                          legend.position === "top-center" ||
                          legend.position === "top-left" ||
                          legend.position === "top-right"
                            ? 0
                            : undefined,
                        bottom:
                          legend.position === "bottom-center" ||
                          legend.position === "bottom-left" ||
                          legend.position === "bottom-right"
                            ? 0
                            : undefined,
                        right: 0,
                        left: 0,
                        margin: 0,
                      }}
                    />
                  )}
                  <Pie
                    data={filteredData}
                    cx={origo.x + "%"}
                    cy={origo.y + "%"}
                    labelLine={false}
                    innerRadius={ring.inner + "%"}
                    outerRadius={ring.outer + "%"}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    stroke={variant === "outline" ? undefined : "none"}
                  >
                    {filteredData.map((entry, index) => {
                      const colorKey =
                        entry.color || getDistributedColor(index, filteredData.length);
                      const baseColor = cssColor(String(colorKey), "data-");
                      const gradientId = getGradientId(String(colorKey));
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={variant === "outline" ? "transparent" : `url(#${gradientId})`}
                          strokeWidth={variant === "outline" ? 2 : 1}
                          stroke={baseColor}
                          style={{ outline: "none" }}
                        />
                      );
                    })}
                  </Pie>
                  {tooltip && (
                    <Tooltip
                      content={(props: any) => {
                        if (props.payload && props.payload.length > 0) {
                          const entry = props.payload[0];
                          const index = filteredData.findIndex(
                            (item) => item[nameKey] === entry.name,
                          );
                          const colorKey =
                            filteredData[index]?.color ||
                            getDistributedColor(index, filteredData.length);
                          props.payload[0].color = cssColor(String(colorKey), "data-");
                        }
                        return (
                          <DataTooltip
                            {...props}
                            label={undefined}
                            date={date}
                            variant={variant as ChartVariant}
                            formatValue={format.tooltip}
                          />
                        );
                      }}
                    />
                  )}
                </RPieChart>
              </ResponsiveContainer>
            );
          })()}
      </ChartPlot>
    </Column>
  );
};

PieChart.displayName = "PieChart";

export default PieChart;
