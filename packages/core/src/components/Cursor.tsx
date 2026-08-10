"use client";

import type React from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flex } from "./Flex";

interface CursorProps {
  cursor: React.ReactNode;
  elementRef?: React.RefObject<HTMLElement | null>;
}

export const Cursor = forwardRef<HTMLDivElement, CursorProps>(({ cursor, elementRef }, ref) => {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const hasPointer = window.matchMedia("(pointer: fine)").matches;
      setIsTouchDevice(hasTouch && !hasPointer);
    };

    checkTouchDevice();

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = () => checkTouchDevice();

    mediaQuery.addEventListener("change", handlePointerChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePointerChange);
    };
  }, []);

  // Mouse tracking for custom cursor (only on non-touch devices)
  useEffect(() => {
    const element = elementRef?.current ?? spanRef.current?.parentElement ?? null;
    if (!cursor || !element || isTouchDevice) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursor, elementRef, isTouchDevice]);

  // Don't render custom cursor on touch devices or during SSR
  if (isTouchDevice || !isHovering || typeof document === "undefined") {
    return <span ref={spanRef} style={{ display: "none" }} />;
  }

  return (
    <>
      <span ref={spanRef} style={{ display: "none" }} />
      {createPortal(
        <Flex
          ref={ref}
          position="fixed"
          pointerEvents="none"
          zIndex={10}
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            transform: "translate(-50%, -50%)",
            transition: "none",
          }}
        >
          {cursor}
        </Flex>,
        document.body,
      )}
    </>
  );
});

Cursor.displayName = "Cursor";
export default Cursor;
