"use client";

import React, { useEffect, useRef } from "react";
import styles from "./TiltFx.module.scss";
import { Flex } from ".";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface TiltFxProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  intensity?: number;
  reducedMotion?: boolean | "auto";
}

const TiltFx: React.FC<TiltFxProps> = ({ children, intensity = 1, reducedMotion = "auto", ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastCallRef = useRef(0);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchDeviceRef = useRef(false);

  const { shouldAnimate } = useReducedMotion(reducedMotion);

  useEffect(() => {
    isTouchDeviceRef.current = "ontouchstart" in window;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDeviceRef.current || !shouldAnimate) return;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    const now = Date.now();
    if (now - lastCallRef.current < 16) return;
    lastCallRef.current = now;

    const element = ref.current;
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

  const handleMouseLeave = () => {
    if (isTouchDeviceRef.current || !shouldAnimate) return;

    const element = ref.current;
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
      ref={ref}
      overflow="hidden"
      className={styles.tiltFx}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export { TiltFx };
TiltFx.displayName = "TiltFx";
