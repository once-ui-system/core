"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Column } from "./Column";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";

export const feedbackVariants = cva("flex w-full items-start rounded-l", {
  variants: {
    variant: {
      info: "border border-solid border-info-border-medium bg-info-background-medium",
      danger: "border border-solid border-danger-border-medium bg-danger-background-medium",
      warning: "border border-solid border-warning-border-medium bg-warning-background-medium",
      success: "border border-solid border-success-border-medium bg-success-background-medium",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export interface FeedbackProps extends Omit<FlexComponentProps, "title"> {
  variant?: "info" | "danger" | "warning" | "success";
  icon?: boolean;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const variantIconMap: Record<"info" | "danger" | "warning" | "success", IconName> = {
  info: "info",
  danger: "danger",
  warning: "warning",
  success: "check",
};

const Feedback = forwardRef<HTMLDivElement, FeedbackProps>(
  (
    {
      variant = "info",
      icon = true,
      title,
      description,
      showCloseButton = false,
      onClose,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    return (
      <Flex
        fillWidth
        radius="l"
        ref={ref}
        border={`${variant}-medium`}
        background={`${variant}-medium`}
        vertical="start"
        role="alert"
        aria-live="assertive"
        className={cn(feedbackVariants({ variant }), className)}
        style={style}
        {...rest}
      >
        {icon && (
          <Flex paddingY="16" paddingLeft="16">
            <Icon
              padding="2"
              radius="m"
              onBackground={`${variant}-medium`}
              name={variantIconMap[variant]}
              aria-hidden="true"
            />
          </Flex>
        )}
        <Column fillWidth padding="16" gap="24" vertical="center">
          {(title || description) && (
            <Column fillWidth gap="2">
              {title && (
                <Flex fillWidth gap="16">
                  <Flex fillWidth paddingY="4">
                    <Text
                      variant="heading-strong-xs"
                      onBackground={`${variant}-medium`}
                      role="heading"
                      aria-level={2}
                    >
                      {title}
                    </Text>
                  </Flex>
                  {showCloseButton && (
                    <IconButton
                      onClick={onClose}
                      icon="close"
                      size="m"
                      tooltip="Hide"
                      tooltipPosition="top"
                      variant="ghost"
                      aria-label="Close alert"
                    />
                  )}
                </Flex>
              )}
              {description && (
                <Text marginBottom="2" variant="body-default-s" onBackground={`${variant}-strong`}>
                  {description}
                </Text>
              )}
            </Column>
          )}
          {children}
        </Column>
      </Flex>
    );
  },
);

Feedback.displayName = "Feedback";

export { Feedback };
