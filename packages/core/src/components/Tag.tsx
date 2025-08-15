"use client";

import React, { forwardRef, ReactNode } from "react";
import classNames from "classnames";

import { Flex, Text, Icon, Row } from ".";
import styles from "./Tag.module.scss";
import { IconName } from "../icons";
import { ColorScheme } from "@/types";

interface TagProps extends React.ComponentProps<typeof Flex> {
  variant?: ColorScheme | "gradient";
  size?: "s" | "m" | "l";
  label?: string;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  children?: ReactNode;
}

const Tag = forwardRef<HTMLDivElement, TagProps>(
  (
    {
      variant = "neutral",
      size = "m",
      label = "",
      prefixIcon,
      suffixIcon,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const paddingX = size === "s" ? "8" : size === "m" ? "8" : "12";
    const paddingY = size === "s" ? "1" : size === "m" ? "2" : "4";

    return (
      <Row
        fitWidth
        background={variant !== "gradient" ? `${variant}-weak` as const : undefined}
        border={variant !== "gradient" ? `${variant}-alpha-medium` as const : "brand-medium"}
        onBackground={variant !== "gradient" ? `${variant}-medium` as const : undefined}
        paddingX={paddingX} paddingY={paddingY}
        vertical="center"
        radius="s"
        gap="4"
        ref={ref}
        className={classNames(styles.tag, variant === "gradient" ? styles.gradient : undefined, className)}
        {...rest}
      >
        {prefixIcon && <Icon name={prefixIcon} size="xs" />}
        <Row style={{ userSelect: "none" }} vertical="center">
          <Text variant="label-default-s">
            {label || children}
          </Text>
        </Row>
        {suffixIcon && <Icon name={suffixIcon} size="xs" />}
      </Row>
    );
  },
);

Tag.displayName = "Tag";

export { Tag };
export type { TagProps };
