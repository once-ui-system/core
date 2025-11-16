"use client";

import React, { useEffect, useState } from "react";
import { Column, Flex, Row, Text } from "../../";
import styles from "./Gauge.module.css";

interface LinearGaugeProps extends React.ComponentProps<typeof Flex> {
  width?: number;
  height?: number;
  line?: {
    count?: number;
    width?: number;
    length?: number;
  };
  value?: number;
  labels?: "none" | "percentage" | string[];
  hue?: "success" | "neutral" | "danger" | [number, number];
  color?: string;
}

const resolveHueRange = (hue: LinearGaugeProps["hue"]): [number, number] => {
  if (hue && typeof hue !== "string") {
    const [start = 200, end = 120] = hue;
    return [start, end];
  }

  if (hue === "danger") return [0, 30];
  if (hue === "neutral") return [30, 60];
  if (hue === "success") return [200, 120];

  return [200, 120];
};

export const LinearGauge = ({
  width = 400,
  height = 80,
  line,
  value = 50,
  labels = "none",
  hue,
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

  const hasHue = hue !== undefined;
  const [startHue, endHue] = resolveHueRange(hue);

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
            stroke: isActive && hasHue
              ? `hsl(${finalHue}, 100%, 50%)`
              : isActive && color ? `var(--data-${color})` : 'var(--neutral-alpha-medium)',
          }}
        />
      );
    }
    return lines;
  };

  const renderLabels = () => {
    if (labels === "none") return null;

    let labelValues: (string | number)[] = [];

    if (labels === "percentage") {
      labelValues = [0, 25, 50, 75, 100].map(p => `${p}%`);
    } else if (Array.isArray(labels)) {
      labelValues = labels;
    }

    return (
      <Row fillWidth horizontal="between" paddingX="8">
        {labelValues.map((label, i) => (
          <Text key={`label-${i}`}>
            {label}
          </Text>
        ))}
      </Row>
    );
  };

  return (
    <Column fillWidth gap="8" textVariant="label-default-s" onBackground="neutral-weak" {...flex}>
      {renderLabels()}
      <Column fillWidth fill>
        <svg 
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
