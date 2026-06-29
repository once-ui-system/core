"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { Flex } from ".";
import styles from "./CursorCard.module.scss";

export interface CursorCardProps extends React.ComponentProps<typeof Flex> {
  trigger?: ReactNode;
  overlay?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CursorCard = forwardRef<HTMLDivElement, CursorCardProps>(
  ({ trigger, overlay, className, style, ...flex }, ref) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const currentPos = useRef({ x: 0, y: 0 });
    const targetPos = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>(0);

    useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

    useEffect(() => {
      setIsTouchDevice("ontouchstart" in window);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    }, []);

    useEffect(() => {
      if (isTouchDevice) return;

      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [handleMouseMove, isTouchDevice]);

    useEffect(() => {
      if (!isHovering || isTouchDevice) {
        cancelAnimationFrame(rafId.current);
        return;
      }

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const animate = () => {
        currentPos.current = {
          x: lerp(currentPos.current.x, targetPos.current.x, 0.15),
          y: lerp(currentPos.current.y, targetPos.current.y, 0.15),
        };

        if (cardRef.current) {
          cardRef.current.style.transform = `translate(calc(${currentPos.current.x}px - 50%), calc(${currentPos.current.y}px - 50%))`;
        }

        rafId.current = requestAnimationFrame(animate);
      };

      rafId.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId.current);
    }, [isHovering, isTouchDevice]);

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
              style={{ isolation: "isolate", ...style }}
              {...flex}
            >
              {overlay}
            </Flex>,
            document.getElementById("cursor-card-portal") || document.body,
          )}
      </>
    );
  },
);

CursorCard.displayName = "CursorCard";

export { CursorCard };
