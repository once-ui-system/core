"use client";

import React, { useEffect, useState } from "react";
import { Column, CountFx, Text } from "../../";
import styles from "./Gauge.module.css";

interface RadialGaugeProps extends Omit<React.ComponentProps<typeof Column>, 'direction'> {
  width?: number;
  height?: number;
  line?: {
    count?: number;
    width?: number;
    length?: number;
  };
  unit?: React.ReactNode;
  value?: number;
  angle?: {
    start: number;
    sweep: number;
  };
  direction?: 'cw' | 'ccw';// default 'cw' (arc rotation direction)
  edgePad?: number;        // default 0, number of ticks to trim at both ends
  children?: React.ReactNode;
  hue?: "success" | "neutral" | "danger" | [number, number];
  color?: string;
}

const resolveHueRange = (hue: RadialGaugeProps["hue"]): [number, number] => {
  if (hue && typeof hue !== "string") {
    const [start = 200, end = 120] = hue;
    return [start, end];
  }

  if (hue === "danger") return [0, 30];
  if (hue === "neutral") return [30, 60];
  if (hue === "success") return [200, 120];

  return [200, 120];
};

export const RadialGauge = ({
  width = 300,
  height = 300,
  line,
  value = 7,
  angle = {
    start: 0,
    sweep: 360,
  },
  direction = 'cw',
  edgePad = 0,
  unit,
  children,
  hue,
  color = "contrast",
  ...flex
}: RadialGaugeProps) => {
  const pad = 4;
  
  // Destructure line with individual defaults
  const lineCount = line?.count ?? 48;
  const lineWidth = line?.width ?? 3;
  const lineLength = line?.length ?? 40;
  
  // For semicircles (sweepAngle ~180), use width or height as the diameter
  // For full circles, use the smaller dimension
  let radius: number;
  let cx: number;
  let cy: number;
  
  if (angle.sweep <= 180) {
    // Semicircle: span the full width, center horizontally
    radius = width / 2 - pad;
    cx = width / 2;
    cy = height; // bottom edge for top semicircle with startAngle=-90
  } else {
    // Full or large arc: use smaller dimension
    radius = Math.min(width, height) / 2 - pad;
    cx = width / 2;
    cy = height / 2;
  }
  
  const ticks = Math.max(0, lineCount - edgePad * 2);

  // Animate active tick count so ticks light up one by one when the value changes
  const [activeLines, setActiveLines] = useState(() => Math.floor((value / 100) * ticks));

  useEffect(() => {
    const target = Math.floor((value / 100) * ticks);

    if (target === activeLines) return;

    let current = activeLines;
    const step = target > current ? 1 : -1;
    const interval = window.setInterval(() => {
      current += step;
      setActiveLines(current);

      if (current === target) {
        window.clearInterval(interval);
      }
    }, 20); // small delay for a smooth, sequential tick animation

    return () => {
      window.clearInterval(interval);
    };
  }, [value, ticks, activeLines]);
  const dir = direction === 'cw' ? 1 : -1;

  // Transform user angles to intuitive system: 0°=left, 90°=top, 180°=right
  // SVG rotation: 0°=up, 90°=right, so user's angle - 90 maps correctly
  const internalStartAngle = angle.start - 90;
  const hasHue = hue !== undefined;
  const [startHue, endHue] = resolveHueRange(hue);

  const renderLines = () => {
    const lines = [];
    for (let j = 0; j < ticks; j++) {
      // map j∈[0,ticks-1] to angle ∈ [startAngle, startAngle + sweepAngle]
      const t = ticks > 1 ? j / (ticks - 1) : 0;
      const finalAngle = internalStartAngle + dir * (t * angle.sweep);
      const isActive = j < activeLines;

      const gradientPosition = t; // 0..1 across the arc

      const finalHue = startHue + (endHue - startHue) * gradientPosition;

      lines.push(
        <line
          key={j}
          x1={cx}
          y1={cy - (radius - pad - lineLength)}
          x2={cx}
          y2={cy - (radius - pad)}
          strokeLinecap="round"
          className={isActive ? styles.activeLine : styles.inactiveLine}
          style={{
            transform: `rotate(${finalAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
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

  return (
    <Column center radius="full">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMid meet" className={styles.svg}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand-solid-strong)" />
            <stop offset="100%" stopColor="var(--accent-solid-strong)" />
          </linearGradient>
        </defs>
        {renderLines()}
      </svg>

      <Column fill position="absolute" horizontal="center" vertical="center" gap="2" {...flex}>
        {children || (
          <CountFx as="div" variant="display-strong-m" style={{ fontFamily: "var(--font-code)", display: "flex" }} value={value} speed={5000}>
            <Text onBackground="neutral-weak" variant="label-default-xl" marginLeft="4" marginTop="4">{unit}</Text>
          </CountFx>
        )}
      </Column>
    </Column>
  );
};