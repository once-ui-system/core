"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Flex } from ".";

interface CursorProps {
  cursor: React.ReactNode;
  elementRef: React.RefObject<HTMLElement | null>;
}

export const Cursor: React.FC<CursorProps> = ({ cursor, elementRef }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      // Check for touch capability
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      // Check for pointer capability (some devices have both mouse and touch)
      const hasPointer = window.matchMedia("(pointer: fine)").matches;

      // Consider it a touch device if it has touch but no fine pointer (mouse)
      setIsTouchDevice(hasTouch && !hasPointer);
    };

    checkTouchDevice();

    // Listen for changes in pointer capability (e.g., when external mouse is connected)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    const handlePointerChange = () => checkTouchDevice();

    mediaQuery.addEventListener("change", handlePointerChange);

    return () => {
      mediaQuery.removeEventListener("change", handlePointerChange);
    };
  }, []);

  // Mouse tracking for custom cursor (only on non-touch devices)
  useEffect(() => {
    if (!cursor || !elementRef.current || isTouchDevice) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel previous animation frame to prevent multiple updates
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Schedule the update for the next animation frame
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

    const element = elementRef.current;
    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (element) {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
      }
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [cursor, elementRef, isTouchDevice]);

  // Don't render custom cursor on touch devices
  if (isTouchDevice || !isHovering) return null;

  return createPortal(
    <Flex
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
  );
};

Cursor.displayName = "Cursor";
export default Cursor;
