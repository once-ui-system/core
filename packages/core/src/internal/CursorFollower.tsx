"use client";

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Flex } from "../components/Flex.js";
import type { Placement } from "../types.js";
import styles from "./CursorFollower.module.scss";

export interface CursorFollowerProps extends React.ComponentProps<typeof Flex> {
  trigger?: ReactNode;
  overlay?: ReactNode;
  /** Which side of the pointer the card sits on; `"bottom-left"` by default. */
  placement?: Placement | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  style?: React.CSSProperties;
}

const CursorFollower = ({
  ref,
  trigger,
  overlay,
  placement = "bottom-left",
  className,
  style,
  ...flex
}: CursorFollowerProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

  useEffect(() => {
    const checkTouchDevice = () => {
      return "ontouchstart" in window;
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isHovering && !isTouchDevice) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    },
    [isHovering, isTouchDevice],
  );

  useEffect(() => {
    if (!isTouchDevice) {
      document.addEventListener("mousemove", handleMouseMove);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [handleMouseMove, isTouchDevice]);

  // Create a portal container if it doesn't exist
  useEffect(() => {
    if (typeof document !== "undefined") {
      let portalContainer = document.getElementById("cursor-card-portal");
      if (!portalContainer) {
        portalContainer = document.createElement("div");
        portalContainer.id = "cursor-card-portal";
        document.body.appendChild(portalContainer);
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        const portalContainer = document.getElementById("cursor-card-portal");
        if (portalContainer && portalContainer.childNodes.length === 0) {
          document.body.removeChild(portalContainer);
        }
      }
    };
  }, []);

  return (
    <>
      {trigger && (
        <Flex
          ref={triggerRef}
          onMouseEnter={() => !isTouchDevice && setIsHovering(true)}
          onMouseLeave={() => !isTouchDevice && setIsHovering(false)}
        >
          {trigger}
        </Flex>
      )}
      {isHovering &&
        !isTouchDevice &&
        typeof document !== "undefined" &&
        createPortal(
          <Flex
            zIndex={10}
            position="fixed"
            top="0"
            left="0"
            pointerEvents="none"
            ref={cardRef}
            className={`${styles.fadeIn} ${className || ""}`}
            style={{
              isolation: "isolate",
              transform: `translate(calc(${mousePosition.x}px ${placement.includes("left") ? "- 100%" : placement.includes("right") ? "" : "- 50%"}), calc(${mousePosition.y}px ${placement.includes("top") ? "- 100%" : placement.includes("bottom") ? "" : "- 50%"}))`,
              ...style,
            }}
            {...flex}
          >
            {overlay}
          </Flex>,
          document.getElementById("cursor-card-portal") || document.body,
        )}
    </>
  );
};

CursorFollower.displayName = "CursorFollower";

export { CursorFollower };
