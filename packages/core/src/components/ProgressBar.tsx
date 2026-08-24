"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { StyleProps } from "../interfaces";
import { Column } from "./Column";
import { CountFx } from "./CountFx";
import { Flex, type FlexComponentProps } from "./Flex";
import { Row } from "./Row";
import { Text } from "./Text";

export const progressBarVariants = cva("w-full", {
  variants: {
    labelPosition: {
      top: "flex-col items-center",
      bottom: "flex-col items-center",
      left: "flex-row items-center",
      right: "flex-row items-center",
    },
  },
  defaultVariants: {
    labelPosition: "bottom",
  },
});

export interface ProgressBarProps extends FlexComponentProps {
  value: number;
  min?: number;
  max?: number;
  label?: boolean;
  labelPosition?: "top" | "bottom" | "left" | "right";
  barBackground?: StyleProps["solid"];
  className?: string;
  style?: CSSProperties;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      label = true,
      labelPosition = "bottom",
      barBackground = "brand-strong",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const range = max - min;
    const percent = range > 0 ? Math.max(0, Math.min(100, ((value - min) / range) * 100)) : 0;
    const isHorizontal = labelPosition === "left" || labelPosition === "right";

    const bar = (
      <Flex
        background="neutral-medium"
        border="neutral-alpha-weak"
        fillWidth
        radius="full"
        overflow="hidden"
        height="8"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      >
        <Flex
          style={{ width: `${percent}%`, transition: "width 1000ms ease-in-out" }}
          fillHeight
          solid={barBackground}
          radius="full"
        />
      </Flex>
    );

    const labelEl = label ? (
      <Text align={isHorizontal ? undefined : "center"}>
        <CountFx value={value} speed={1000} easing="ease-in-out" />%
      </Text>
    ) : null;

    if (isHorizontal) {
      return (
        <Row
          gap="16"
          fillWidth
          vertical="center"
          ref={ref}
          style={style}
          className={cn(progressBarVariants({ labelPosition }), className)}
          {...rest}
        >
          {labelPosition === "left" && labelEl}
          {bar}
          {labelPosition === "right" && labelEl}
        </Row>
      );
    }

    return (
      <Column
        horizontal="center"
        gap="16"
        fillWidth
        ref={ref}
        style={style}
        className={cn(progressBarVariants({ labelPosition }), className)}
        {...rest}
      >
        {labelPosition === "top" && labelEl}
        {bar}
        {labelPosition === "bottom" && labelEl}
      </Column>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
