"use client";

import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "../classes/utils";
import { Card } from "./Card";
import { Column } from "./Column";
import { Row, type RowProps } from "./Row";

export interface SplitViewProps extends RowProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultSplit?: number;
  minSplit?: number;
  maxSplit?: number;
  className?: string;
  style?: CSSProperties;
}

function useResizeHandle(
  containerRef: RefObject<HTMLDivElement | null>,
  direction: "row" | "column",
  defaultSplit = 0.3,
  minSplit = 0.2,
  maxSplit = 0.8,
) {
  const [splitRatio, setSplitRatio] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      let newRatio: number;
      if (direction === "row") {
        newRatio = (e.clientX - rect.left) / rect.width;
      } else {
        newRatio = (e.clientY - rect.top) / rect.height;
      }

      setSplitRatio(Math.max(minSplit, Math.min(maxSplit, newRatio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = direction === "row" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, direction, minSplit, maxSplit, containerRef]);

  return { splitRatio, isDragging, setIsDragging };
}

const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(
  (
    {
      leftPanel,
      rightPanel,
      defaultSplit = 0.3,
      minSplit = 0.2,
      maxSplit = 0.8,
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const [direction, setDirection] = useState<"row" | "column">("row");
    const { splitRatio, isDragging, setIsDragging } = useResizeHandle(
      containerRef,
      direction,
      defaultSplit,
      minSplit,
      maxSplit,
    );

    // Detect direction from flex props or computed styles
    useEffect(() => {
      const updateDirection = () => {
        if (!containerRef.current) return;
        const computedStyle = window.getComputedStyle(containerRef.current);
        const flexDir = computedStyle.flexDirection;
        setDirection(flexDir === "column" ? "column" : "row");
      };

      updateDirection();
      window.addEventListener("resize", updateDirection);
      return () => window.removeEventListener("resize", updateDirection);
    }, []);

    const isHorizontal = direction === "row";
    const splitPercentage = `${splitRatio * 100}%`;
    const remainingPercentage = `${(1 - splitRatio) * 100}%`;

    return (
      <Row
        ref={containerRef}
        fill
        className={cn("w-full h-full", className)}
        style={style}
        {...flex}
      >
        {/* Left/Top Panel */}
        <Column
          fill
          className="overflow-auto min-w-0 min-h-0"
          style={{
            [isHorizontal ? "width" : "height"]: splitPercentage,
          }}
        >
          {leftPanel}
        </Column>

        {/* Resize Handle */}
        <Row
          fillHeight={isHorizontal}
          fillWidth={!isHorizontal}
          minWidth={isHorizontal ? "12" : undefined}
          minHeight={!isHorizontal ? "12" : undefined}
          paddingX={isHorizontal ? "8" : undefined}
          paddingY={!isHorizontal ? "8" : undefined}
          center
          onMouseDown={() => setIsDragging(true)}
          className={cn("select-none", isHorizontal ? "cursor-col-resize" : "cursor-row-resize")}
        >
          <Row
            fillWidth={isHorizontal}
            fillHeight={!isHorizontal}
            height={isHorizontal ? 8 : undefined}
            width={!isHorizontal ? 8 : undefined}
          >
            <Card
              fill
              background={isDragging ? "neutral-strong" : "neutral-weak"}
              border="neutral-alpha-weak"
              radius="full"
              className={cn(
                "transition-colors duration-200",
                isHorizontal ? "cursor-col-resize" : "cursor-row-resize",
              )}
            />
          </Row>
        </Row>

        {/* Right/Bottom Panel */}
        <Column
          fill
          className="overflow-auto min-w-0 min-h-0"
          style={{
            [isHorizontal ? "width" : "height"]: remainingPercentage,
          }}
        >
          {rightPanel}
        </Column>
      </Row>
    );
  },
);

SplitView.displayName = "SplitView";

export { SplitView };
