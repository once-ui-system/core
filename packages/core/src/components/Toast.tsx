"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { IconName } from "../icons";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Row } from "./Row";
import styles from "./Toast.module.scss";

interface ToastProps {
  className?: string;
  variant: "success" | "danger" | "warning" | "info";
  showIcon?: boolean;
  onClose?: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
  /**
   * Milliseconds before the toast hides itself. Defaults to 6000. The
   * countdown pauses while the toast is hovered or holds focus; `Infinity`
   * keeps it up until it is closed.
   */
  duration?: number;
}

const iconMap: { [key in ToastProps["variant"]]: IconName } = {
  success: "check",
  danger: "danger",
  warning: "warning",
  info: "info",
};

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    // The default is a literal so the generated props spec (ai/) states it.
    { variant, className, showIcon = true, onClose, action, children, duration = 6000 },
    ref,
  ) => {
    const [visible, setVisible] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    // What is left of the countdown. A pause keeps it rather than restarting
    // the full duration, so reading a toast never extends it past what the
    // caller asked for plus the time spent on it.
    const remaining = useRef(duration);

    useEffect(() => {
      remaining.current = duration;
    }, [duration]);

    // Paused while the pointer is on the toast or focus is inside it: someone
    // reading the message, or tabbing to its action, should not have it
    // disappear under them (WCAG 2.2.1).
    useEffect(() => {
      if (!visible || hovered || focused || !Number.isFinite(duration)) return;
      const startedAt = Date.now();
      const timer = setTimeout(() => setVisible(false), Math.max(0, remaining.current));
      return () => {
        clearTimeout(timer);
        remaining.current -= Date.now() - startedAt;
      };
    }, [visible, hovered, focused, duration]);

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
        // Only a danger toast interrupts. Everything else waits for the screen
        // reader to finish what it is saying: a "saved" confirmation announced
        // assertively cuts off whatever the user was listening to.
        role={variant === "danger" ? "alert" : "status"}
        aria-live={variant === "danger" ? "assertive" : "polite"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          // Moving between the action and the close button stays inside.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
          }
        }}
        className={classNames(className, styles.toast, styles[variant], {
          [styles.visible]: visible,
          [styles.hidden]: !visible,
        })}
      >
        <Flex fillWidth vertical="center" gap="8">
          {showIcon && <Icon size="s" onBackground={`${variant}-medium`} name={iconMap[variant]} />}
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
