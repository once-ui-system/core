import type React from "react";
import { forwardRef } from "react";
import { Row } from "../components/Row.js";
import type { Tone, TShirtSizes } from "../types.js";
import styles from "./PulseRing.module.scss";

export interface PulseRingProps extends React.ComponentProps<typeof Row> {
  tone: Tone;
  size: TShirtSizes;
  pulseSize?: string | number;
}

// The box, the ring that pulses and the dot, per size: s, m and l are 2.x Pulse's.
const BOX = { xs: "12", s: "16", m: "24", l: "32", xl: "40" } as const;
const RING = { xs: "24", s: "32", m: "48", l: "64", xl: "80" } as const;
const DOT = { xs: "2", s: "4", m: "8", l: "12", xl: "16" } as const;

/** `<StatusIndicator pulse>` (2.x's Pulse): a dot in a ring that keeps pulsing out. */
export const PulseRing = forwardRef<HTMLDivElement, PulseRingProps>(
  ({ tone, size, pulseSize, ...flex }, ref) => (
    <Row ref={ref} minWidth={BOX[size]} minHeight={BOX[size]} center data-solid="color" {...flex}>
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
  ),
);

PulseRing.displayName = "PulseRing";
