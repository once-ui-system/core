"use client";

import React, { useEffect, useState } from "react";
import { Column, CountFx, Text } from "../../";
import styles from "./RadialGauge.module.css";

interface RadialGaugeProps extends Omit<React.ComponentProps<typeof Column>, 'direction'> {
  width?: number;
  height?: number;
  lineCount?: number;
  lineWidth?: number;
  lineLength?: number;
  unit?: React.ReactNode;
  value?: number;
  startAngle?: number;     // 0=left, 90=top, 180=right, 270=bottom (intuitive coordinate system)
  sweepAngle?: number;     // arc span in degrees (e.g., 180 for semicircle, 240 for gauge)
  direction?: 'cw' | 'ccw';// default 'cw' (arc rotation direction)
  edgePad?: number;        // default 0, number of ticks to trim at both ends
  children?: React.ReactNode;
  health?: "good" | "normal" | "bad";
}

export const RadialGauge = ({
  width = 300,
  height = 300,
  lineCount = 60,
  lineWidth = 3,
  lineLength = 40,
  value = 7,
  startAngle = 0,       // 0=left; use 90 for top-centered arcs
  sweepAngle = 360,
  direction = 'cw',
  edgePad = 0,
  unit,
  children,
  health = "good",
  ...flex
}: RadialGaugeProps) => {
  const pad = 4;
  
  // For semicircles (sweepAngle ~180), use width or height as the diameter
  // For full circles, use the smaller dimension
  let radius: number;
  let cx: number;
  let cy: number;
  
  if (sweepAngle <= 180) {
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
  const internalStartAngle = startAngle - 90;

  const renderLines = () => {
    const lines = [];
    for (let j = 0; j < ticks; j++) {
      // map j∈[0,ticks-1] to angle ∈ [startAngle, startAngle + sweepAngle]
      const t = ticks > 1 ? j / (ticks - 1) : 0;
      const angle = internalStartAngle + dir * (t * sweepAngle);
      const isActive = j < activeLines;

      const gradientPosition = t; // 0..1 across the arc

      // Determine hue ramp based on health
      const [startHue, endHue] =
        health === 'bad'
          ? [0, 30]         // red -> orange
          : health === 'normal'
          ? [30, 60]        // orange -> yellow
          : [200, 120];     // blue -> green (good)

      const hue = startHue + (endHue - startHue) * gradientPosition;

      lines.push(
        <line
          key={j}
          x1={cx}
          y1={cy - (radius - lineLength)}
          x2={cx}
          y2={cy - radius + 10}
          strokeLinecap="round"
          className={isActive ? styles.activeLine : styles.inactiveLine}
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            strokeWidth: lineWidth,
            opacity: isActive ? 1 : 0.7,
            stroke: isActive
              ? `hsl(${hue}, 100%, 50%)`
              : 'var(--neutral-alpha-medium)',
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