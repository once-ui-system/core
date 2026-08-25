"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "../classes/utils";
import { useInViewport } from "../hooks/useInViewport";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Flex, type FlexComponentProps } from "./Flex";

export const maskVariants = cva(
  "[mask-size:100%_100%] [-webkit-mask-size:100%_100%] [mask-image:radial-gradient(var(--mask-radius)_at_var(--mask-position-x)_var(--mask-position-y),black_0%,transparent_100%)] [-webkit-mask-image:radial-gradient(var(--mask-radius)_at_var(--mask-position-x)_var(--mask-position-y),black_0%,transparent_100%)]",
);

export interface MaskProps extends Omit<FlexComponentProps, "radius" | "cursor"> {
  cursor?: boolean;
  x?: number;
  y?: number;
  radius?: number;
  reducedMotion?: boolean | "auto";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const Mask = forwardRef<HTMLDivElement, MaskProps>(
  (
    {
      cursor = false,
      x,
      y,
      radius = 50,
      reducedMotion = "auto",
      children,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const maskRef = useRef<HTMLDivElement>(null);
    const cursorPosRef = useRef({ x: 0, y: 0 });
    const smoothPosRef = useRef({ x: 0, y: 0 });
    const rafIdRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => maskRef.current as HTMLDivElement);

    const isInViewport = useInViewport(maskRef);
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const isActive = cursor && isInViewport && shouldAnimate;

    const writeCssVars = useCallback((px: number, py: number) => {
      const el = maskRef.current;
      if (!el) return;
      el.style.setProperty("--mask-position-x", `${px}px`);
      el.style.setProperty("--mask-position-y", `${py}px`);
    }, []);

    useEffect(() => {
      if (!isActive) return;

      const handleMouseMove = (event: MouseEvent) => {
        const el = maskRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        cursorPosRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      };

      document.addEventListener("mousemove", handleMouseMove, { passive: true });

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [isActive]);

    useEffect(() => {
      if (!isActive) {
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        return;
      }

      const easingFactor = 0.05;
      const convergenceThreshold = 0.5;

      const tick = () => {
        const target = cursorPosRef.current;
        const prev = smoothPosRef.current;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;

        if (Math.abs(dx) > convergenceThreshold || Math.abs(dy) > convergenceThreshold) {
          const nx = prev.x + dx * easingFactor;
          const ny = prev.y + dy * easingFactor;
          smoothPosRef.current = { x: nx, y: ny };
          writeCssVars(nx, ny);
        }

        rafIdRef.current = requestAnimationFrame(tick);
      };

      rafIdRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafIdRef.current != null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }, [isActive, writeCssVars]);

    const maskStyle = (): CSSProperties => {
      if (cursor) {
        return {
          "--mask-position-x": `${smoothPosRef.current.x}px`,
          "--mask-position-y": `${smoothPosRef.current.y}px`,
          "--mask-radius": `${radius}vh`,
        } as CSSProperties;
      }

      if (x != null && y != null) {
        return {
          "--mask-position-x": `${x}%`,
          "--mask-position-y": `${y}%`,
          "--mask-radius": `${radius}vh`,
        } as CSSProperties;
      }

      return {};
    };

    return (
      <Flex
        ref={maskRef}
        fill
        top="0"
        left="0"
        zIndex={0}
        overflow="hidden"
        className={cn(maskVariants(), className)}
        style={{
          ...maskStyle(),
          ...style,
        }}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

Mask.displayName = "Mask";

export { Mask };
