"use client";

import type React from "react";
import { Column } from "../../components/Column.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import type { FlexElementProps, SizeProps } from "../../interfaces.js";
import { ChartHeader } from "./ChartHeader.js";
import { ChartStatus } from "./ChartStatus.js";
import type { ValueFormat } from "./interfaces.js";

/**
 * What Treemap, Heatmap and DivergingBars share with the other charts: a
 * card with a title, the loading, error and empty states, and how numbers
 * are written.
 */
export interface MagnitudeChartProps extends Omit<FlexElementProps, "title" | "description"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** How values are written on the marks, in the hover card and in their accessible names. */
  valueFormat?: ValueFormat;
  /** The BCP 47 locale numbers are written in. Defaults to `"en-US"`. */
  locale?: string;
  /** Show the hover card on hover and focus. Defaults to `true`. */
  tooltip?: boolean;
  loading?: boolean;
  error?: boolean;
  emptyState?: React.ReactNode;
  errorState?: React.ReactNode;
  /** The chart's accessible name. Defaults to `title` when it is a string. */
  "aria-label"?: string;
}

interface FrameProps extends Omit<MagnitudeChartProps, "valueFormat" | "locale" | "tooltip"> {
  empty: boolean;
  /** `fill` takes the data theme's height (Treemap); `content` grows with its rows. */
  sizing: "fill" | "content";
  children: React.ReactNode;
}

/**
 * The card: header, then the status or the chart.
 *
 * Internal: not exported from the data barrel.
 */
export function MagnitudeFrame({
  title,
  description,
  loading = false,
  error = false,
  emptyState,
  errorState,
  empty,
  sizing,
  border = "neutral-alpha-weak",
  children,
  "aria-label": _label,
  ...flex
}: FrameProps) {
  const { height } = useDataTheme();
  const status = loading || error || empty;
  return (
    <Column
      fillWidth
      height={sizing === "fill" ? (height as SizeProps["height"]) : undefined}
      border={border}
      radius="l"
      {...flex}
    >
      <ChartHeader title={title} description={description} />
      <Column
        fillWidth
        flex={1}
        padding="16"
        borderTop={title || description ? border || "neutral-alpha-weak" : undefined}
      >
        {status ? (
          <Column fill style={{ minHeight: 160 }}>
            <ChartStatus
              loading={loading}
              error={error}
              empty={empty}
              emptyState={emptyState}
              errorState={errorState}
            />
          </Column>
        ) : (
          children
        )}
      </Column>
    </Column>
  );
}

/** The chart's accessible name: the author's label, else a string title. */
export const frameLabel = (label: string | undefined, title: React.ReactNode) =>
  label ?? (typeof title === "string" ? title : undefined);
