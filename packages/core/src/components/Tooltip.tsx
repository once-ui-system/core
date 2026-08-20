import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Icon } from "./Icon";
import { Row, type RowProps } from "./Row";

export interface TooltipProps extends RowProps {
  label: ReactNode;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  className?: string;
  style?: CSSProperties;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ label, prefixIcon, suffixIcon, className, style, ...flex }, ref) => {
    return (
      <Row
        m={{ hide: true }}
        ref={ref}
        vertical="center"
        gap="4"
        zIndex={1}
        background="surface"
        paddingY="4"
        paddingX="8"
        radius="s"
        border="neutral-medium"
        role="tooltip"
        className={cn("animate-fadeIn select-none whitespace-nowrap", className)}
        style={style}
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
