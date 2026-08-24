"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Row } from "./Row";

export const toastVariants = cva("transition-[opacity,transform] duration-300", {
  variants: {
    variant: {
      success: "",
      danger: "",
      warning: "",
      info: "",
    },
    visible: {
      true: "opacity-100",
      false: "opacity-0 pointer-events-none",
    },
  },
  defaultVariants: {
    variant: "info",
    visible: true,
  },
});

export interface ToastProps extends Omit<FlexComponentProps, "children"> {
  className?: string;
  variant: "success" | "danger" | "warning" | "info";
  icon?: boolean;
  onClose?: () => void;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}

const iconMap: Record<ToastProps["variant"], IconName> = {
  success: "check",
  danger: "danger",
  warning: "warning",
  info: "info",
};

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ variant, className, style, icon = true, onClose, action, children, ...rest }, ref) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
      if (!visible && onClose) {
        onClose();
      }
    }, [visible, onClose]);

    return (
      <Flex
        ref={ref}
        fillWidth
        background="surface"
        radius="l"
        paddingY="12"
        paddingX="20"
        border="neutral-medium"
        role="alert"
        aria-live="assertive"
        className={cn(toastVariants({ variant, visible }), className)}
        style={style}
        {...rest}
      >
        <Flex fillWidth vertical="center" gap="8">
          {icon && <Icon size="s" onBackground={`${variant}-medium`} name={iconMap[variant]} />}
          <Row fillWidth textVariant="body-default-s">
            {children}
          </Row>
          {action && action}
          {onClose && (
            <IconButton
              variant="ghost"
              icon="close"
              size="m"
              tooltip="Hide"
              tooltipPosition="top"
              onClick={() => setVisible(false)}
            />
          )}
        </Flex>
      </Flex>
    );
  },
);

Toast.displayName = "Toast";

export { Toast };
