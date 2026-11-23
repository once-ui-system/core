"use client";

import type React from "react";
import { useMemo } from "react";
import { cssColor } from "../../internal/cssColor.js";
import type { ColorValue } from "../../types.js";
import { type ChartCardContent, cardLabel, useHoverCard, withSign } from "./HoverCard.js";
import type { DataPoint, SeriesKey } from "./interfaces.js";
import styles from "./Magnitude.module.css";
import { frameLabel, type MagnitudeChartProps, MagnitudeFrame } from "./MagnitudeFrame.js";
import { makeValueFormatter } from "./utils/chartSeries.js";

export interface DivergingBarsProps<T extends object = DataPoint> extends MagnitudeChartProps {
  /** One row per bar, drawn in the order given. */
  data: readonly T[];
  /** The row key of each bar's signed value. Defaults to `"value"`. */
  dataKey?: SeriesKey<T>;
  /** The row key that names each bar. Defaults to `"label"`. */
  nameKey?: SeriesKey<T>;
  /** Bars above zero. Defaults to emerald. */
  gainColor?: ColorValue;
  /** Bars below zero. Defaults to orange. */
  lossColor?: ColorValue;
}

/**
 * Where zero sits across the track, in percent: where the largest loss ends,
 * so a list with no losses uses the whole width and one with only losses
 * grows leftward. Returns the shared span too.
 */
export function divergingScale(values: readonly number[]): { zero: number; span: number } {
  const low = Math.max(0, ...values.map((v) => -v));
  const high = Math.max(0, ...values.map((v) => v));
  const span = Math.max(1e-9, low + high);
  return { zero: (low / span) * 100, span };
}

/**
 * Above or below zero per item, on one shared scale: gains grow right in the
 * gain colour, losses left in the loss colour. Each row writes its value, so
 * colour is never the only cue.
 */
const DivergingBars = <T extends object = DataPoint>({
  data,
  dataKey = "value" as SeriesKey<T>,
  nameKey = "label" as SeriesKey<T>,
  gainColor,
  lossColor,
  valueFormat,
  locale,
  tooltip = true,
  title,
  "aria-label": label,
  ...frame
}: DivergingBarsProps<T>) => {
  const { box, handlers, layer } = useHoverCard(tooltip);
  const format = useMemo(() => makeValueFormatter(valueFormat, locale), [valueFormat, locale]);
  const bars = (data as readonly Record<string, unknown>[]).map((row) => {
    const value = row[dataKey];
    return {
      name: String(row[nameKey] ?? ""),
      value: typeof value === "number" && Number.isFinite(value) ? value : 0,
    };
  });
  const { zero, span } = divergingScale(bars.map((bar) => bar.value));
  const signed = withSign(format);

  const colors = {
    ...(gainColor ? { "--chart-gain": cssColor(gainColor, "data-") } : {}),
    ...(lossColor ? { "--chart-loss": cssColor(lossColor, "data-") } : {}),
  } as React.CSSProperties;

  return (
    <MagnitudeFrame {...frame} title={title} sizing="content" empty={bars.length === 0}>
      <div ref={box} className={styles.root} style={colors}>
        <figure className={styles.diverging} aria-label={frameLabel(label, title)}>
          {bars.map((bar) => {
            const card: ChartCardContent = { title: bar.name, lines: [signed(bar.value)] };
            const side = bar.value >= 0 ? { left: `${zero}%` } : { right: `${100 - zero}%` };
            return (
              <div key={bar.name} style={{ display: "contents" }}>
                <span className={styles.name} aria-hidden="true">
                  {bar.name}
                </span>
                <div className={styles.track}>
                  <span className={styles.zero} style={{ left: `${zero}%` }} />
                  <button
                    type="button"
                    aria-label={cardLabel(card)}
                    className={`${styles.mark} ${styles.bar} ${
                      bar.value >= 0 ? styles.barGain : styles.barLoss
                    }`}
                    style={{
                      ...side,
                      width: bar.value === 0 ? 2 : `${(Math.abs(bar.value) / span) * 100}%`,
                    }}
                    {...handlers(card)}
                  />
                </div>
                <span className={styles.value} aria-hidden="true">
                  {signed(bar.value)}
                </span>
              </div>
            );
          })}
        </figure>
        {layer}
      </div>
    </MagnitudeFrame>
  );
};

DivergingBars.displayName = "DivergingBars";

export { DivergingBars };
