"use client";

import React from "react";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { useDataTheme } from "../../contexts/DataThemeProvider.js";
import styles from "./Chart.module.css";
import { ChartVariant } from "./interfaces.js";
import { Swatch } from "./Swatch.js";

interface LegendProps {
  payload?: readonly Record<string, any>[];
  labels?: "x" | "y" | "both" | "none";
  colors?: string[];
  reverseY?: boolean;
  direction?: "row" | "column";
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  variant?: ChartVariant;
  /** The y axis' width in px, so a top-left legend starts where the plot does. Defaults to 64. */
  axisWidth?: number;
  /** Which entries the reader has hidden, by index; they show dimmed. */
  hidden?: readonly boolean[];
  /** Makes each entry a button that shows or hides its series. */
  onToggle?: (index: number) => void;
}

const Legend = ({
  payload,
  labels = "both",
  position = "top-left",
  reverseY,
  direction,
  colors,
  variant,
  axisWidth = 64,
  hidden,
  onToggle,
}: LegendProps) => {
  // Read the theme on every render: as a default parameter the hook ran only
  // when `variant` was omitted.
  const theme = useDataTheme();
  const chartVariant = variant ?? theme.variant;

  if (!payload || !payload.length) {
    return null;
  }

  const getPositionStyle = () => {
    switch (position) {
      case "top-left":
        // Past the y axis, the legend starts where the plot does: offset by
        // the axis, not `calc(axis + space)`, which jsdom cannot compute and
        // so broke every role query in a test that renders a chart.
        return (labels === "y" || labels === "both") && !reverseY
          ? {
              left: `${axisWidth}px`,
              right: 0,
              width: "auto",
              paddingLeft: "var(--static-space-16)",
              top: "var(--static-space-12)",
            }
          : { paddingLeft: "var(--static-space-20)", top: "var(--static-space-12)" };
      case "top-right":
        return {
          paddingRight: "var(--static-space-20)",
          top: "var(--static-space-12)",
          justifyContent: "flex-end",
        };
      case "bottom-left":
        return {
          paddingLeft: "var(--static-space-20)",
          bottom: "var(--static-space-12)",
        };
      case "bottom-right":
        return {
          paddingRight: "var(--static-space-20)",
          bottom: "var(--static-space-12)",
          justifyContent: "flex-end",
        };
      case "top-center":
        return {
          left: "50%",
          top: "var(--static-space-12)",
          transform: "translateX(-50%)",
        };
      case "bottom-center":
        return {
          left: "50%",
          bottom: "var(--static-space-12)",
          transform: "translateX(-50%)",
        };
      default:
        return {
          paddingLeft:
            labels === "y" || labels === "both"
              ? "var(--static-space-80)"
              : "var(--static-space-20)",
          top: "0.75rem",
        };
    }
  };

  const positionStyle = getPositionStyle();

  return (
    <Row
      wrap
      fillWidth
      horizontal={
        position === "top-left" ||
        position === "top-right" ||
        position === "bottom-left" ||
        position === "bottom-right"
          ? "start"
          : "center"
      }
      vertical="center"
      position="absolute"
      gap="16"
      pointerEvents="none"
      direction={direction}
      style={positionStyle}
    >
      {payload.map((entry: Record<string, any>, index: number) => {
        const color = colors && colors[index] ? colors[index] : entry.stroke || entry.color;
        const content = (
          <>
            <Swatch color={color} size="m" variant={chartVariant} />
            <Text textVariant="label-default-s" wrap="nowrap">
              {entry.value}
            </Text>
          </>
        );
        // The legend lets the pointer through to the plot; only its buttons catch it.
        return onToggle ? (
          <button
            key={index}
            type="button"
            className={styles.legendItem}
            aria-pressed={!hidden?.[index]}
            onClick={() => onToggle(index)}
          >
            {content}
          </button>
        ) : (
          <Row key={index} vertical="center" gap="8">
            {content}
          </Row>
        );
      })}
    </Row>
  );
};

export type { LegendProps };
export { Legend };
