"use client";

import type React from "react";
import { useMemo } from "react";
import { cssColor } from "../../internal/cssColor.js";
import type { ColorValue } from "../../types.js";
import { type ChartCardContent, cardLabel, useHoverCard } from "./HoverCard.js";
import type { DataPoint, SeriesKey } from "./interfaces.js";
import styles from "./Magnitude.module.css";
import { frameLabel, type MagnitudeChartProps, MagnitudeFrame } from "./MagnitudeFrame.js";
import { makeValueFormatter } from "./utils/chartSeries.js";

/** A heatmap column: the row key it reads, and the heading it shows. */
export interface HeatmapColumn<T = DataPoint> {
  key: SeriesKey<T>;
  /** Defaults to `key`. */
  label?: string;
}

export interface HeatmapProps<T extends object = DataPoint> extends MagnitudeChartProps {
  /** One row per line of cells: a year, a client, a weekday. */
  data: readonly T[];
  /**
   * The columns, left to right, as row keys or `{ key, label }`: the months
   * of a year, the hours of a day.
   */
  columns: readonly (SeriesKey<T> | HeatmapColumn<T>)[];
  /** The row key that names each row. Defaults to `"label"`. */
  rowKey?: SeriesKey<T>;
  /** The one hue the cells are drawn in, stronger for more. Defaults to emerald. */
  color?: ColorValue;
  /** The scale under the grid. Defaults to shown, from `"Less"` to `"More"`. */
  legend?: { display?: boolean; less?: string; more?: string };
}

/** Five steps of one hue, light to strong. */
const STEPS = [38, 54, 70, 85, 100];

/** The step a value falls in, 0 to 4, against the largest value in the grid. */
export function heatmapStep(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(STEPS.length - 1, Math.floor((value / max) * STEPS.length - 1e-9)));
}

const shade = (step: number) =>
  `color-mix(in oklch, var(--chart-seq) ${STEPS[step]}%, transparent)`;

/**
 * A grid of rows by columns, each cell's colour its size in one hue. Empty,
 * zero and negative cells stay neutral: a heatmap shows how much, not which
 * way (DivergingBars shows direction).
 */
const Heatmap = <T extends object = DataPoint>({
  data,
  columns: columnsProp,
  rowKey = "label" as SeriesKey<T>,
  color,
  legend,
  valueFormat,
  locale,
  tooltip = true,
  title,
  "aria-label": label,
  ...frame
}: HeatmapProps<T>) => {
  const { box, handlers, layer } = useHoverCard(tooltip);
  const format = useMemo(() => makeValueFormatter(valueFormat, locale), [valueFormat, locale]);
  const columns = columnsProp.map((column) =>
    typeof column === "string"
      ? { key: column as string, label: column as string }
      : { key: column.key as string, label: column.label ?? (column.key as string) },
  );
  const rows = (data as readonly Record<string, unknown>[]).map((row) => ({
    name: String(row[rowKey] ?? ""),
    cells: columns.map((column) => {
      const value = row[column.key];
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    }),
  }));
  const max = Math.max(0, ...rows.flatMap((row) => row.cells.map((cell) => cell ?? 0)));
  const showScale = legend?.display !== false;

  return (
    <MagnitudeFrame
      {...frame}
      title={title}
      sizing="content"
      empty={rows.length === 0 || columns.length === 0}
    >
      <div
        ref={box}
        className={styles.root}
        style={
          color ? ({ "--chart-seq": cssColor(color, "data-") } as React.CSSProperties) : undefined
        }
      >
        <figure
          className={styles.heatmap}
          aria-label={frameLabel(label, title)}
          style={{
            gridTemplateColumns: `max-content repeat(${columns.length}, minmax(14px, 1fr))`,
          }}
        >
          <span />
          {columns.map((column) => (
            <span
              key={column.key}
              className={styles.axisLabel}
              style={{ textAlign: "center" }}
              aria-hidden="true"
            >
              {column.label}
            </span>
          ))}
          {rows.map((row) => (
            <div key={row.name} style={{ display: "contents" }}>
              <span className={styles.axisLabel} style={{ paddingRight: 8 }} aria-hidden="true">
                {row.name}
              </span>
              {row.cells.map((value, c) => {
                const column = columns[c];
                const card: ChartCardContent = {
                  title: `${row.name} ${column.label}`,
                  lines: [value === null ? "No data" : format(value)],
                };
                return (
                  <button
                    type="button"
                    key={column.key}
                    aria-label={cardLabel(card)}
                    className={`${styles.mark} ${styles.cell}`}
                    style={{
                      background:
                        value !== null && value > 0
                          ? shade(heatmapStep(value, max))
                          : "var(--neutral-alpha-weak)",
                    }}
                    {...handlers(card)}
                  />
                );
              })}
            </div>
          ))}
        </figure>
        {showScale && (
          <div className={styles.scale} aria-hidden="true">
            <span className={styles.axisLabel} style={{ marginRight: 6 }}>
              {legend?.less ?? "Less"}
            </span>
            {STEPS.map((strength, step) => (
              <span
                key={strength}
                className={styles.scaleCell}
                style={{ background: shade(step) }}
              />
            ))}
            <span className={styles.axisLabel} style={{ marginLeft: 6 }}>
              {legend?.more ?? "More"}
            </span>
          </div>
        )}
        {layer}
      </div>
    </MagnitudeFrame>
  );
};

Heatmap.displayName = "Heatmap";

export { Heatmap };
