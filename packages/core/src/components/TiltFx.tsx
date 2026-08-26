"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, MouseEvent, MutableRefObject, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { cn } from "../classes/utils";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Flex, type FlexComponentProps } from "./Flex";

export const tiltFxVariants = cva(
  "transition-transform duration-300 ease-out [@media(hover:hover)]:[perspective:1000px] [@media(hover:hover)]:[transform-style:preserve-3d] [@media(hover:hover)]:will-change-transform",
);
const TILT_FX_BASE = tiltFxVariants();

export interface TiltFxProps extends FlexComponentProps {
  children?: ReactNode;
  intensity?: number;
  reducedMotion?: boolean | "auto";
  className?: string;
  style?: CSSProperties;
}

const TiltFx = forwardRef<HTMLDivElement, TiltFxProps>(
  (
    {
      children,
      intensity = 1,
      reducedMotion = "auto",
      className,
      style,
      onMouseMove,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const lastCallRef = useRef(0);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTouchDeviceRef = useRef(false);

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    const { shouldAnimate } = useReducedMotion(reducedMotion);

    useEffect(() => {
      const checkTouchDevice = () => {
        const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        const hasPointer = window.matchMedia("(pointer: fine)").matches;
        return hasTouch && !hasPointer;
      };

      isTouchDeviceRef.current = checkTouchDevice();

      const mediaQuery = window.matchMedia("(pointer: fine)");
      const handlePointerChange = () => {
        isTouchDeviceRef.current = checkTouchDevice();
      };

      mediaQuery.addEventListener("change", handlePointerChange);

      return () => {
        mediaQuery.removeEventListener("change", handlePointerChange);
      };
    }, []);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);

      if (isTouchDeviceRef.current || !shouldAnimate) return;

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }

      const now = Date.now();
      if (now - lastCallRef.current < 16) return;
      lastCallRef.current = now;

      const element = internalRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (offsetX - centerX) / centerX;
      const deltaY = (offsetY - centerY) / centerY;

      const rotateX = -deltaY * 2 * intensity;
      const rotateY = -deltaX * 2 * intensity;
      const translateZ = 30 * intensity;

      window.requestAnimationFrame(() => {
        element.style.transform = `perspective(1000px) translate3d(0, 0, ${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    };

    const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);

      if (isTouchDeviceRef.current || !shouldAnimate) return;

      const element = internalRef.current;
      if (element) {
        resetTimeoutRef.current = setTimeout(() => {
          element.style.transform =
            "perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";
          resetTimeoutRef.current = null;
        }, 100);
      }
    };

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    return (
      <Flex
        ref={mergedRef}
        overflow="hidden"
        className={cn(TILT_FX_BASE, className)}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

TiltFx.displayName = "TiltFx";

export { TiltFx };
