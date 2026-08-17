"use client";

import type { ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Row, type RowProps } from "./Row";

export interface HoverProps extends RowProps {
  trigger?: ReactNode;
  overlay?: ReactNode;
  interactive?: boolean;
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  touch?: "disable" | "enable" | "display";
}

const Hover = forwardRef<HTMLDivElement, HoverProps>(
  (
    {
      trigger,
      overlay,
      children,
      interactive = false,
      delay = 0,
      hideDelay = 0,
      disabled = false,
      touch = "disable",
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    useEffect(() => {
      setMounted(true);
      const checkTouchDevice = () => {
        const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const hasPointer = window.matchMedia("(pointer: fine)").matches;
        return hasTouch && !hasPointer;
      };

      setIsTouchDevice(checkTouchDevice());

      const mediaQuery = window.matchMedia("(pointer: fine)");
      const handlePointerChange = () => setIsTouchDevice(checkTouchDevice());

      mediaQuery.addEventListener("change", handlePointerChange);

      return () => {
        mediaQuery.removeEventListener("change", handlePointerChange);
      };
    }, []);

    const showOverlay = useCallback(() => {
      if (disabled) return;

      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (delay > 0) {
        showTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
        }, delay);
      } else {
        setIsHovered(true);
      }
    }, [delay, disabled]);

    const hideOverlay = useCallback(() => {
      // Clear any pending show timeout
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      if (hideDelay > 0) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
        }, hideDelay);
      } else {
        setIsHovered(false);
      }
    }, [hideDelay]);

    const handleMouseEnter = useCallback(() => {
      showOverlay();
    }, [showOverlay]);

    const handleMouseLeave = useCallback(() => {
      hideOverlay();
    }, [hideOverlay]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      showOverlay();
    }, [showOverlay]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      hideOverlay();
    }, [hideOverlay]);

    // Cleanup timeouts on unmount
    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    // Determine if overlay should show based on touch mode
    const shouldShowOverlay = (() => {
      if (!mounted || disabled) return false;

      // If on touch device, handle based on touch prop
      if (isTouchDevice) {
        if (touch === "disable") return false;
        if (touch === "display") return true;
        // touch === 'enable', fall through to normal hover logic
      }

      return isHovered || isFocused;
    })();

    return (
      <Row
        ref={wrapperRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(className)}
        style={style}
        {...flex}
      >
        {trigger}
        {children}
        {shouldShowOverlay && (
          <Row
            position="absolute"
            pointerEvents={interactive ? "auto" : "none"}
            fill
            top="0"
            left="0"
            right="0"
            bottom="0"
            className="animate-fadeIn"
          >
            {overlay}
          </Row>
        )}
      </Row>
    );
  },
);

Hover.displayName = "Hover";

export { Hover };
