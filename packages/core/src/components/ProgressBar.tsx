"use client";

import React, { forwardRef } from "react";
import classNames from "classnames";
import { Flex } from ".";
import { StyleProps } from "@/interfaces";

interface ProgressBarProps extends React.ComponentProps<"div"> {
  value: number;
  min?: number;
  max?: number;
  height?: number;
  className?: string;
  barBackground?: StyleProps["background"];
  trackBackground?: StyleProps["background"];
  style?: React.CSSProperties;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      height = 1,
      className,
      style,
      barBackground = "brand-strong",
      trackBackground = "brand-weak",
      ...rest
    },
    ref
  ) => {
    const percent = Math.max(
      0,
      Math.min(100, ((value - min) / (max - min)) * 100)
    );
    return (
      <Flex
        ref={ref}
        className={classNames(className)}
        background={trackBackground}
        position="relative"
        fillWidth
        radius="m-4"
        overflow="hidden"
        height={height}
        role="progressbar"
        style={style}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        {...rest}
      >
        <Flex
          style={{ width: `${percent}%` }}
          transition="micro-short"
          fillHeight
          background={barBackground}
          radius="m-4"
        />
      </Flex>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
export { ProgressBar };
