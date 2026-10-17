"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useRef } from "react";
import { DisplayProps } from "../interfaces";
import { cssColor } from "../internal/cssColor";
import { ColorValue, CSSUnit, SpacingToken } from "../types";
import styles from "./Background.module.scss";
import { Flex } from "./Flex";
import { Mask, MaskProps } from "./Mask";

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as React.RefObject<T | null>).current = value;
  }
}

interface GradientProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  /**
   * Where the gradient's centre sits across the element: a number is px from
   * the left edge, a string a CSS length (`"50%"`, the default, is the
   * middle). Was a bare percentage until 3.0 (`x: 50` is `x: "50%"` now).
   */
  x?: number | CSSUnit;
  /** As `x`, from the top edge. */
  y?: number | CSSUnit;
  /**
   * The gradient ellipse's horizontal radius: a number is px, a string a CSS
   * length, a percentage of the element's width (`"100%"`, the default).
   * Until 3.0 a bare number was a quarter-percent (`width: 100` is
   * `width: "100%"` now).
   */
  width?: number | CSSUnit;
  /** As `width`, vertically, as a percentage of the element's height. */
  height?: number | CSSUnit;
  tilt?: number;
  colorStart?: ColorValue;
  colorEnd?: ColorValue;
}

interface DotsProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  color?: ColorValue;
  size?: SpacingToken;
}

interface GridProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  color?: ColorValue;
  width?: string;
  height?: string;
}

interface LinesProps {
  display?: boolean;
  opacity?: DisplayProps["opacity"];
  size?: SpacingToken;
  thickness?: number;
  angle?: number;
  color?: ColorValue;
}

interface BackgroundProps extends React.ComponentProps<typeof Flex> {
  gradient?: GradientProps;
  dots?: DotsProps;
  grid?: GridProps;
  lines?: LinesProps;
  mask?: MaskProps;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const Background = forwardRef<HTMLDivElement, BackgroundProps>(
  (
    { gradient = {}, dots = {}, grid = {}, lines = {}, mask, children, className, style, ...rest },
    forwardedRef,
  ) => {
    const dotsColor = dots.color ?? "brand-on-background-weak";
    const dotsSize = "var(--static-space-" + (dots.size ?? "24") + ")";

    const backgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setRef(forwardedRef, backgroundRef.current);
    }, [forwardedRef]);

    // The gradient layer is four times the element and starts 1.5 widths
    // before it (Background.module.scss), so a position or radius given
    // against the element is converted to that layer here: a percentage is a
    // quarter of itself plus the 37.5% offset, and a fixed length is unchanged.
    const position = (value: number | string | undefined) => {
      if (value == null) return "50%";
      if (typeof value === "number") return `calc(37.5% + ${value}px)`;
      const percent = /^(-?\d*\.?\d+)%$/.exec(value);
      if (percent) return `${37.5 + Number(percent[1]) / 4}%`;
      return `calc(37.5% + ${value})`;
    };
    const extent = (value: number | string | undefined) => {
      if (value == null) return "25%";
      if (typeof value === "number") return `${value}px`;
      const percent = /^(-?\d*\.?\d+)%$/.exec(value);
      return percent ? `${Number(percent[1]) / 4}%` : value;
    };

    const renderContent = () => (
      <>
        {gradient.display && (
          <Flex
            position="absolute"
            className={styles.gradient}
            opacity={gradient.opacity}
            pointerEvents="none"
            style={{
              ["--gradient-position-x" as string]: position(gradient.x),
              ["--gradient-position-y" as string]: position(gradient.y),
              ["--gradient-width" as string]: extent(gradient.width),
              ["--gradient-height" as string]: extent(gradient.height),
              ["--gradient-tilt" as string]: gradient.tilt != null ? `${gradient.tilt}deg` : "0deg",
              ["--gradient-color-start" as string]: gradient.colorStart
                ? cssColor(gradient.colorStart)
                : "var(--brand-background-strong)",
              ["--gradient-color-end" as string]: gradient.colorEnd
                ? cssColor(gradient.colorEnd)
                : "var(--static-transparent)",
            }}
          />
        )}
        {dots.display && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            className={styles.dots}
            opacity={dots.opacity}
            style={
              {
                "--dots-color": cssColor(dotsColor),
                "--dots-size": dotsSize,
              } as React.CSSProperties
            }
          />
        )}
        {lines.display &&
          (() => {
            const angle = lines.angle ?? -45;
            const angleRad = (angle * Math.PI) / 180;
            // Adjust spacing to maintain uniform perpendicular distance
            // For diagonal lines, multiply by the secant of the angle
            const adjustmentFactor = 1 / Math.cos(angleRad);
            const baseSpacing = lines.size ?? "8";

            return (
              <Flex
                position="absolute"
                top="0"
                left="0"
                fill
                pointerEvents="none"
                className={styles.lines}
                opacity={lines.opacity}
                style={
                  {
                    "--lines-angle": `${angle}deg`,
                    "--lines-color": cssColor(lines.color ?? "brand-on-background-weak"),
                    "--lines-thickness": `${lines.thickness ?? 1}px`,
                    "--lines-spacing": `calc(var(--static-space-${baseSpacing}) * ${adjustmentFactor})`,
                    background: `
                  repeating-linear-gradient(
                    var(--lines-angle),
                    var(--static-transparent),
                    var(--static-transparent) calc(var(--lines-spacing) - var(--lines-thickness)),
                    var(--lines-color) calc(var(--lines-spacing) - var(--lines-thickness)),
                    var(--lines-color) var(--lines-spacing)
                  )
                `,
                  } as React.CSSProperties
                }
              />
            );
          })()}
        {grid.display && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            fill
            pointerEvents="none"
            opacity={grid.opacity}
            style={{
              backgroundImage: `linear-gradient(to right, ${cssColor(grid.color ?? "brand-on-background-weak")} 1px, transparent 1px), linear-gradient(to bottom, ${cssColor(grid.color ?? "brand-on-background-weak")} 1px, transparent 1px)`,
              backgroundSize: `${grid.width ?? "80px"} ${grid.height ?? "80px"}`,
            }}
          />
        )}
        {children}
      </>
    );

    return (
      <Flex
        ref={backgroundRef}
        fill
        className={classNames(className)}
        zIndex={0}
        overflow="hidden"
        style={style}
        {...rest}
      >
        {mask ? (
          <Mask
            fill
            position="absolute"
            cursor={mask.cursor}
            radius={mask.radius}
            x={mask.x}
            y={mask.y}
          >
            {renderContent()}
          </Mask>
        ) : (
          renderContent()
        )}
      </Flex>
    );
  },
);

Background.displayName = "Background";

export { Background };
