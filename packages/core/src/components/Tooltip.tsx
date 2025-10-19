import React, { forwardRef, ReactNode } from "react";
import classNames from "classnames";

import { Icon, Row } from ".";
import { IconName } from "../icons";
import styles from "./Tooltip.module.scss";

interface TooltipProps extends React.ComponentProps<typeof Row> {
  label: ReactNode;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  className?: string;
  style?: React.CSSProperties;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ label, prefixIcon, suffixIcon, className, style, ...flex }, ref) => {
    return (
      <Row
        m={{ hide: true }}
        ref={ref}
        style={{
          whiteSpace: "nowrap",
          userSelect: "none",
          ...style,
        }}
        vertical="center"
        gap="4"
        zIndex={1}
        background="surface"
        paddingY="4"
        paddingX="8"
        radius="s"
        border="neutral-medium"
        role="tooltip"
        className={classNames(styles.fadeIn, className)}
        {...flex}
      >
        {prefixIcon && <Icon name={prefixIcon} size="xs" />}
        <Row
          paddingX="2"
          vertical="center"
          textVariant="body-default-xs"
          onBackground="neutral-strong"
        >
          {label}
        </Row>
        {suffixIcon && <Icon name={suffixIcon} size="xs" />}
      </Row>
    );
  },
);

Tooltip.displayName = "Tooltip";

export { Tooltip };
