"use client";

import { forwardRef, ReactNode } from "react";
import { Tone, TShirtSizes } from "../types";
import styles from "./Pulse.module.scss";
import { Row } from "./Row";

interface PulseProps extends React.ComponentProps<typeof Row> {
  /** The palette. 2.x called this `scheme`. */
  tone?: Tone;
  size?: TShirtSizes;
  pulseSize?: string | number;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// The box, the ring that pulses and the dot, per size: s, m and l are 2.x's.
const BOX = { xs: "12", s: "16", m: "24", l: "32", xl: "40" } as const;
const RING = { xs: "24", s: "32", m: "48", l: "64", xl: "80" } as const;
const DOT = { xs: "2", s: "4", m: "8", l: "12", xl: "16" } as const;

const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  (
    { children, className, style, size = "m", pulseSize, tone = "brand", ...flex }: PulseProps,
    ref,
  ) => {
    return (
      <Row
        ref={ref}
        minWidth={BOX[size]}
        minHeight={BOX[size]}
        center
        data-solid="color"
        className={className}
        style={style}
        {...flex}
      >
        <Row position="absolute" className={styles.position}>
          <Row
            solid={`${tone}-medium`}
            radius="full"
            className={styles.dot}
            width={RING[size]}
            height={RING[size]}
            style={pulseSize != null ? { width: pulseSize, height: pulseSize } : undefined}
          />
        </Row>
        <Row solid={`${tone}-strong`} minWidth={DOT[size]} minHeight={DOT[size]} radius="full" />
      </Row>
    );
  },
);

Pulse.displayName = "Pulse";

export { Pulse };
