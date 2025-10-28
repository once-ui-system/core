"use client";

import { ReactNode, forwardRef } from "react";
import { Row } from ".";
import styles from "./Pulse.module.scss";
import { CondensedTShirtSizes, ColorScheme } from "../types";

interface PulseProps extends React.ComponentProps<typeof Row> {
  variant?: ColorScheme;
  size?: CondensedTShirtSizes;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({ children, className, style, size = "m", variant = "brand", ...flex }: PulseProps, ref) => {
    return (
      <Row ref={ref} minWidth={size === "s" ? "16" : size === "m" ? "24" : "32"} minHeight={size === "s" ? "16" : size === "m" ? "24" : "32"} center data-solid="color" className={className} style={style} {...flex}>
        <Row position="absolute" className={styles.position}>
          <Row
            solid={`${variant}-medium`}
            radius="full"
            className={styles.dot}
            width={size === "s" ? "32" : size === "m" ? "48" : "64"}
            height={size === "s" ? "32" : size === "m" ? "48" : "64"}
          />
        </Row>
        <Row
          solid={`${variant}-strong`}
          minWidth={size === "s" ? "4" : size === "m" ? "8" : "12"}
          minHeight={size === "s" ? "4" : size === "m" ? "8" : "12"}
          radius="full"
        />
      </Row>
    );
  },
);

Pulse.displayName = "Pulse";
export { Pulse };
