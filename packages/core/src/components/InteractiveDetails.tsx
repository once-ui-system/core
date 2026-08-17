"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { IconButton, type IconButtonProps } from "./IconButton";
import { Row } from "./Row";
import { Text } from "./Text";

export interface InteractiveDetailsProps {
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  iconButtonProps?: IconButtonProps;
  onClick?: (event?: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const InteractiveDetails = forwardRef<HTMLDivElement, InteractiveDetailsProps>(
  (
    {
      label,
      description,
      iconButtonProps,
      onClick,
      className,
      id,
      disabled,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <Column
        ref={ref}
        cursor={disabled ? "not-allowed" : undefined}
        className={cn(className)}
        onClick={onClick}
        id={id}
        style={style}
        {...props}
      >
        <Row gap="4" vertical="center">
          {label !== undefined && label !== null && (
            <Text
              as="span"
              variant="label-default-m"
              onBackground={disabled ? "neutral-weak" : "neutral-strong"}
            >
              {label}
            </Text>
          )}
          {iconButtonProps?.tooltip && (
            <IconButton
              size="s"
              variant="ghost"
              icon="help"
              {...iconButtonProps}
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                iconButtonProps.onClick?.(e);
              }}
            />
          )}
        </Row>
        {description && (
          <Text as="span" variant="body-default-s" onBackground="neutral-weak">
            {description}
          </Text>
        )}
        {children}
      </Column>
    );
  },
);

InteractiveDetails.displayName = "InteractiveDetails";

export { InteractiveDetails };
