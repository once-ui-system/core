"use client";

import type React from "react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Card, Column, Row, SegmentedControl } from ".";
import { type BreakpointKey, useLayout } from "../contexts";

interface SplitViewProps extends React.ComponentProps<typeof Row> {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  /**
   * Tab labels for the collapsed layout. Without them the split still
   * collapses, but the tabs read "1" and "2" — so pass these whenever
   * `collapseBelow` is in play.
   */
  labels?: { left: string; right: string };
  /**
   * At or below this breakpoint the split becomes tabs showing one panel at a
   * time. A drag-resizable split is a poor pattern on a phone whichever way it
   * is oriented: the panes are too small to be useful at any ratio, and a
   * drag handle competes with page scrolling. Pass `false` to keep the split
   * at every size.
   */
  collapseBelow?: BreakpointKey | false;
  /** Starting ratio for the first panel, 0–1. */
  defaultSplit?: number;
  minSplit?: number;
  maxSplit?: number;
}

/**
 * Drag state for the divider.
 *
 * Pointer events rather than mouse events: `mousedown`/`mousemove` never fire
 * for touch, which is why the divider could not be dragged on a touch device at
 * all. Pointer events cover mouse, touch and pen in one path, and pointer
 * capture keeps the drag alive when the finger or cursor leaves the handle.
 */
function useResizeHandle(
  containerRef: React.RefObject<HTMLDivElement | null>,
  direction: "row" | "column",
  { defaultSplit, minSplit, maxSplit }: { defaultSplit: number; minSplit: number; maxSplit: number },
) {
  const [splitRatio, setSplitRatio] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);

  const applyClientPosition = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const ratio =
        direction === "row"
          ? (clientX - rect.left) / rect.width
          : (clientY - rect.top) / rect.height;
      if (!Number.isFinite(ratio)) return;
      setSplitRatio(Math.max(minSplit, Math.min(maxSplit, ratio)));
    },
    [containerRef, direction, minSplit, maxSplit],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: PointerEvent) => applyClientPosition(e.clientX, e.clientY);
    const onUp = () => setIsDragging(false);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    const previousCursor = document.body.style.cursor;
    const previousSelect = document.body.style.userSelect;
    document.body.style.cursor = direction === "row" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousSelect;
    };
  }, [isDragging, direction, applyClientPosition]);

  return { splitRatio, setSplitRatio, isDragging, setIsDragging, applyClientPosition };
}

function SplitView({
  leftPanel,
  rightPanel,
  labels,
  collapseBelow = "s",
  defaultSplit = 0.3,
  minSplit = 0.2,
  maxSplit = 0.8,
  ...flex
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<"row" | "column">("row");
  const { maxWidth } = useLayout();
  const [activePanel, setActivePanel] = useState<"left" | "right">("left");

  const { splitRatio, setSplitRatio, isDragging, setIsDragging, applyClientPosition } =
    useResizeHandle(containerRef, direction, { defaultSplit, minSplit, maxSplit });

  useEffect(() => {
    const updateDirection = () => {
      if (!containerRef.current) return;
      const flexDir = window.getComputedStyle(containerRef.current).flexDirection;
      setDirection(flexDir === "column" ? "column" : "row");
    };
    updateDirection();
    window.addEventListener("resize", updateDirection);
    return () => window.removeEventListener("resize", updateDirection);
  }, []);

  const collapsed = collapseBelow !== false && maxWidth(collapseBelow);

  if (collapsed) {
    const leftLabel = labels?.left ?? "1";
    const rightLabel = labels?.right ?? "2";
    return (
      <Column fill gap="12" {...flex}>
        <SegmentedControl
          fillWidth
          buttons={[
            { value: "left", label: leftLabel },
            { value: "right", label: rightLabel },
          ]}
          value={activePanel}
          onChange={(value) => setActivePanel(value === "right" ? "right" : "left")}
        />
        <Column fill overflowY="auto" minHeight={0}>
          {activePanel === "left" ? leftPanel : rightPanel}
        </Column>
      </Column>
    );
  }

  const isHorizontal = direction === "row";
  const step = 0.05;

  return (
    <Row ref={containerRef} fill {...flex}>
      <Column
        fill
        style={{
          [isHorizontal ? "width" : "height"]: `${splitRatio * 100}%`,
          [isHorizontal ? "minWidth" : "minHeight"]: 0,
          overflow: "auto",
        }}
      >
        {leftPanel}
      </Column>

      <Row
        fillHeight={isHorizontal}
        fillWidth={!isHorizontal}
        minWidth={isHorizontal ? "12" : undefined}
        minHeight={!isHorizontal ? "12" : undefined}
        paddingX={isHorizontal ? "8" : undefined}
        paddingY={!isHorizontal ? "8" : undefined}
        center
        // Keyboard-operable: a pointer-only divider is unreachable without one.
        role="separator"
        aria-orientation={isHorizontal ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(splitRatio * 100)}
        aria-valuemin={Math.round(minSplit * 100)}
        aria-valuemax={Math.round(maxSplit * 100)}
        aria-label="Resize panels"
        tabIndex={0}
        onPointerDown={(event: React.PointerEvent) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
          applyClientPosition(event.clientX, event.clientY);
        }}
        onKeyDown={(event: React.KeyboardEvent) => {
          const back = isHorizontal ? "ArrowLeft" : "ArrowUp";
          const forward = isHorizontal ? "ArrowRight" : "ArrowDown";
          if (event.key !== back && event.key !== forward) return;
          event.preventDefault();
          const next = splitRatio + (event.key === forward ? step : -step);
          setSplitRatio(Math.max(minSplit, Math.min(maxSplit, next)));
        }}
        style={{
          cursor: isHorizontal ? "col-resize" : "row-resize",
          userSelect: "none",
          touchAction: "none",
        }}
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
            style={{
              cursor: isHorizontal ? "col-resize" : "row-resize",
              transition: "background 0.2s ease",
            }}
          />
        </Row>
      </Row>

      <Column
        fill
        style={{
          [isHorizontal ? "width" : "height"]: `${(1 - splitRatio) * 100}%`,
          [isHorizontal ? "minWidth" : "minHeight"]: 0,
          overflow: "auto",
        }}
      >
        {rightPanel}
      </Column>
    </Row>
  );
}

SplitView.displayName = "SplitView";

export { SplitView };
export type { SplitViewProps };
