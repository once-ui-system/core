"use client";

import React, { useEffect, useState } from "react";
import { Column } from "../../components/Column.js";
import { Flex } from "../../components/Flex.js";
import { Row } from "../../components/Row.js";
import { Text } from "../../components/Text.js";
import { cssColor } from "../../internal/cssColor.js";
import { ColorValue } from "../../types.js";
import styles from "./Gauge.module.css";

export interface LinearGaugeProps extends React.ComponentProps<typeof Flex> {
  /**
   * The drawing's width in px. The gauge scales to fit its container, so this
   * sets its proportions; it is px like every other size, but it is not the
   * box's `width` (put `maxWidth` on the gauge for that).
   */
  width?: number;
  /** The drawing's height in px; see `width`. */
  height?: number;
  line?: {
    count?: number;
    width?: number;
    length?: number;
  };
  value?: number;
  labels?: "none" | "percentage" | string[];
  /**
   * Colours the active lines on a hue ramp for the tone: `success` blue to
   * green, `warning` and `neutral` orange to yellow, `danger` red to orange.
   * 2.x called this `hue`.
   */
  tone?: "success" | "neutral" | "warning" | "danger";
  /** A hue ramp of your own, from start to end (0–360). Wins over `tone`. */
  hueRange?: [number, number];
  color?: ColorValue;
}

const resolveHueRange = (
  tone?: LinearGaugeProps["tone"],
  hueRange?: [number, number],
): [number, number] => {
  if (hueRange) {
    const [start = 200, end = 120] = hueRange;
    return [start, end];
  }

  if (tone === "danger") return [0, 30];
  if (tone === "neutral" || tone === "warning") return [30, 60];
  if (tone === "success") return [200, 120];

  return [200, 120];
};
export const LinearGauge = ({
  width = 400,
  height = 80,
  line,
  value = 50,
  labels = "none",
  tone,
  hueRange,
  color = "contrast",
  ...flex
}: LinearGaugeProps) => {
  const pad = 8;

  // Destructure line with individual defaults
  const lineCount = line?.count ?? 48;
  const lineWidth = line?.width ?? 3;
  const lineLength = line?.length ?? 40;

  // Animate active tick count
  const [activeLines, setActiveLines] = useState(() => Math.floor((value / 100) * lineCount));

  useEffect(() => {
    const target = Math.floor((value / 100) * lineCount);

    if (target === activeLines) return;

    let current = activeLines;
    const step = target > current ? 1 : -1;
    const interval = window.setInterval(() => {
      current += step;
      setActiveLines(current);

      if (current === target) {
        window.clearInterval(interval);
      }
    }, 20);

    return () => {
      window.clearInterval(interval);
    };
  }, [value, lineCount, activeLines]);

  const hasHue = tone !== undefined || hueRange !== undefined;
  const [startHue, endHue] = resolveHueRange(tone, hueRange);

  const renderLines = () => {
    const lines = [];
    const spacing = (width - pad * 2) / (lineCount - 1);

    for (let j = 0; j < lineCount; j++) {
      const x = pad + j * spacing;
      const isActive = j < activeLines;
      const gradientPosition = lineCount > 1 ? j / (lineCount - 1) : 0;
      const finalHue = startHue + (endHue - startHue) * gradientPosition;

      lines.push(
        <line
          key={j}
          x1={x}
          y1={0}
          x2={x}
          y2={lineLength}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={isActive ? styles.activeLine : styles.inactiveLine}
          style={{
            strokeWidth: lineWidth,
            opacity: isActive ? 1 : 0.7,
            stroke:
              isActive && hasHue
                ? `hsl(${finalHue}, 100%, 50%)`
                : isActive && color
                  ? cssColor(color, "data-")
                  : "var(--neutral-alpha-medium)",
          }}
        />,
      );
    }
    return lines;
  };

  const renderLabels = () => {
    if (labels === "none") return null;

    let labelValues: (string | number)[] = [];

    if (labels === "percentage") {
      labelValues = [0, 25, 50, 75, 100].map((p) => `${p}%`);
    } else if (Array.isArray(labels)) {
      labelValues = labels;
    }

    return (
      <Row fillWidth horizontal="between" paddingX="8">
        {labelValues.map((label, i) => (
          <Text key={`label-${i}`}>{label}</Text>
        ))}
      </Row>
    );
  };

  return (
    <Column
      fillWidth
      gap="8"
      textVariant="label-default-s"
      onBackground="neutral-weak"
      // A gauge is a meter: without the role its value was only lit ticks.
      role="meter"
      aria-label="Gauge"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      {...flex}
    >
      {renderLabels()}
      <Column fillWidth fill>
        <svg
          aria-hidden="true"
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${lineLength}`}
          preserveAspectRatio="none"
          className={styles.svg}
        >
          {renderLines()}
        </svg>
      </Column>
    </Column>
  );
};
