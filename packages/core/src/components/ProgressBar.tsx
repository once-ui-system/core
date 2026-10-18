import classNames from "clsx";
import React, { forwardRef } from "react";
import { StyleProps } from "../interfaces.js";
import { CountUp } from "../internal/CountUp.js";
import { Column } from "./Column.js";
import { Flex } from "./Flex.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

interface ProgressBarProps extends React.ComponentProps<typeof Flex> {
  value: number;
  min?: number;
  max?: number;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom" | "left" | "right";
  barBackground?: StyleProps["solid"];
  className?: string;
  style?: React.CSSProperties;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      showLabel = true,
      labelPosition = "bottom",
      barBackground = "brand-strong",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    const isHorizontal = labelPosition === "left" || labelPosition === "right";

    const bar = (
      <Flex
        background="neutral-medium"
        border
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

    const labelEl = showLabel ? (
      <Text align={isHorizontal ? undefined : "center"}>
        <CountUp value={value} duration={1000} easing="ease-in-out" />%
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
          className={classNames(className)}
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
        className={classNames(className)}
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
