"use client";

import type React from "react";
import { useMemo } from "react";
import { cssColor } from "../../internal/cssColor.js";
import type { ColorValue } from "../../types.js";
import { type ChartCardContent, cardLabel, useHoverCard, withSign } from "./HoverCard.js";
import type { DataPoint, SeriesKey, ValueFormat } from "./interfaces.js";
import styles from "./Magnitude.module.css";
import { frameLabel, type MagnitudeChartProps, MagnitudeFrame } from "./MagnitudeFrame.js";
import { makeValueFormatter } from "./utils/chartSeries.js";

export interface TreemapProps<T extends object = DataPoint> extends MagnitudeChartProps {
  /** One row per tile. Rows with no positive size are left out. */
  data: readonly T[];
  /** The row key that sizes each tile. Defaults to `"value"`. */
  dataKey?: SeriesKey<T>;
  /** The row key that names each tile. Defaults to `"label"`. */
  nameKey?: SeriesKey<T>;
  /**
   * The row key that colours each tile by direction: above zero in the gain
   * colour, below zero in the loss colour, stronger the further from zero.
   * Without it every tile is neutral, and area alone carries the data.
   */
  toneKey?: SeriesKey<T>;
  /**
   * The tone at full strength. Defaults to the largest tone in the data, so
   * the strongest tile is the strongest colour.
   */
  toneMax?: number;
  /** How tones are written in the hover card. Defaults to `valueFormat`. */
  toneFormat?: ValueFormat;
  /** The row key whose text is the tile's second line, when it fits (a share, say). */
  subKey?: SeriesKey<T>;
  /** Tiles above zero. Defaults to emerald. */
  gainColor?: ColorValue;
  /** Tiles below zero. Defaults to orange. */
  lossColor?: ColorValue;
}

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Squarified treemap (Bruls, Huizing, van Wijk): rows of tiles kept close to
 * square. `values` should be sorted largest first.
 */
export function squarify(values: readonly number[], box: Rect): Rect[] {
  const total = values.reduce((sum, v) => sum + v, 0);
  if (total <= 0) return values.map(() => ({ x: box.x, y: box.y, w: 0, h: 0 }));
  const scale = (box.w * box.h) / total;
  const areas = values.map((v) => v * scale);
  const out: Rect[] = new Array(values.length);
  let free = { ...box };
  let start = 0;

  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, b) => a + b, 0);
    const max = Math.max(...row);
    const min = Math.min(...row);
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min));
  };

  while (start < areas.length) {
    const side = Math.min(free.w, free.h);
    let end = start + 1;
    while (
      end < areas.length &&
      worst(areas.slice(start, end + 1), side) <= worst(areas.slice(start, end), side)
    )
      end++;
    const row = areas.slice(start, end);
    const sum = row.reduce((a, b) => a + b, 0);
    if (free.w >= free.h) {
      const width = sum / free.h;
      let y = free.y;
      row.forEach((area, i) => {
        const h = area / width;
        out[start + i] = { x: free.x, y, w: width, h };
        y += h;
      });
      free = { x: free.x + width, y: free.y, w: free.w - width, h: free.h };
    } else {
      const height = sum / free.w;
      let x = free.x;
      row.forEach((area, i) => {
        const w = area / height;
        out[start + i] = { x, y: free.y, w, h: height };
        x += w;
      });
      free = { x: free.x, y: free.y + height, w: free.w, h: free.h - height };
    }
    start = end;
  }
  return out;
}

const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Area is size, colour is direction: each tile an item, its area its value,
 * its colour how far it is up or down. Tiles are laid out largest first, in
 * percentages, so the map reflows with its box and renders on the server.
 */
const Treemap = <T extends object = DataPoint>({
  data,
  dataKey = "value" as SeriesKey<T>,
  nameKey = "label" as SeriesKey<T>,
  toneKey,
  toneMax,
  toneFormat,
  subKey,
  gainColor,
  lossColor,
  valueFormat,
  locale,
  tooltip = true,
  title,
  "aria-label": label,
  ...frame
}: TreemapProps<T>) => {
  const { box, handlers, layer } = useHoverCard(tooltip);
  const formatValue = useMemo(() => makeValueFormatter(valueFormat, locale), [valueFormat, locale]);
  const formatTone = useMemo(
    () => withSign(makeValueFormatter(toneFormat ?? valueFormat, locale)),
    [toneFormat, valueFormat, locale],
  );

  const tiles = useMemo(() => {
    const rows = (data as readonly Record<string, unknown>[])
      .map((row) => ({
        name: String(row[nameKey] ?? ""),
        value: num(row[dataKey]) ?? 0,
        tone: toneKey ? num(row[toneKey]) : null,
        sub: subKey && row[subKey] != null ? String(row[subKey]) : undefined,
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value);
    const rects = squarify(
      rows.map((row) => row.value),
      { x: 0, y: 0, w: 100, h: 100 },
    );
    return rows.map((row, i) => ({ ...row, rect: rects[i] }));
  }, [data, dataKey, nameKey, toneKey, subKey]);

  const strongest =
    toneMax ?? Math.max(0, ...tiles.map((tile) => (tile.tone === null ? 0 : Math.abs(tile.tone))));

  const fill = (tone: number | null) => {
    if (tone === null || strongest <= 0 || Math.abs(tone) / strongest < 0.02)
      return "var(--neutral-alpha-weak)";
    const strength = Math.round(25 + Math.min(1, Math.abs(tone) / strongest) * 60);
    return `color-mix(in oklch, var(${tone > 0 ? "--chart-gain" : "--chart-loss"}) ${strength}%, transparent)`;
  };

  const colors = {
    height: "100%",
    ...(gainColor ? { "--chart-gain": cssColor(gainColor, "data-") } : {}),
    ...(lossColor ? { "--chart-loss": cssColor(lossColor, "data-") } : {}),
  } as React.CSSProperties;

  return (
    <MagnitudeFrame {...frame} title={title} sizing="fill" empty={tiles.length === 0}>
      <div ref={box} className={styles.root} style={colors}>
        <figure className={styles.treemap} aria-label={frameLabel(label, title)}>
          {tiles.map((tile) => {
            const r = tile.rect;
            const card: ChartCardContent = {
              title: tile.name,
              lines: [
                formatValue(tile.value),
                ...(tile.tone !== null ? [formatTone(tile.tone)] : []),
                ...(tile.sub ? [tile.sub] : []),
              ],
            };
            return (
              <button
                type="button"
                key={tile.name}
                aria-label={cardLabel(card)}
                className={`${styles.mark} ${styles.tile}`}
                style={{
                  left: `${r.x}%`,
                  top: `${r.y}%`,
                  width: `${r.w}%`,
                  height: `${r.h}%`,
                  background: fill(tile.tone),
                }}
                {...handlers(card)}
              >
                {r.w > 5 && r.h > 9 && (
                  <span className={styles.tileLabel} aria-hidden="true">
                    {tile.name}
                  </span>
                )}
                {r.w > 9 && r.h > 16 && tile.sub && (
                  <span className={styles.tileSub} aria-hidden="true">
                    {tile.sub}
                  </span>
                )}
              </button>
            );
          })}
        </figure>
        {layer}
      </div>
    </MagnitudeFrame>
  );
};

Treemap.displayName = "Treemap";

export { Treemap };
