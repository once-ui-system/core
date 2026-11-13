"use client";

import { createPortal } from "react-dom";
import styles from "./Canvas.module.css";
import { useCanvas } from "./CanvasContext.js";
import { type CanvasGuide, worldToScreen } from "./geometry.js";

export interface SnapGuidesProps {
  /** The guides `snapRect` returned for the drag in progress. */
  guides: CanvasGuide[];
  /** Label each guide with the gap it spans. Default true. */
  showGaps?: boolean;
  /** Formats a gap in world units. Default: rounded to a whole number. */
  formatGap?: (gap: number) => string;
}

/**
 * The alignment lines shown while something snaps to its neighbours, with the
 * gap between them, in screen space.
 */
export function SnapGuides({ guides, showGaps = true, formatGap }: SnapGuidesProps) {
  const gapText = formatGap ?? ((g: number) => `${Math.round(g)}`);
  const { view, overlay } = useCanvas();
  if (!overlay || guides.length === 0) return null;
  const lines = guides.map((g) => {
    const a = worldToScreen(
      g.axis === "x" ? { x: g.at, y: g.start } : { x: g.start, y: g.at },
      view,
    );
    const b = worldToScreen(g.axis === "x" ? { x: g.at, y: g.end } : { x: g.end, y: g.at }, view);
    return { g, a, b };
  });
  return createPortal(
    <>
      <svg className={styles.guides} aria-hidden="true">
        {lines.map(({ g, a, b }) => (
          <line
            key={`${g.axis}-${g.at}`}
            className={styles.guideLine}
            x1={Math.round(a.x) + 0.5}
            y1={Math.round(a.y) + 0.5}
            x2={Math.round(b.x) + 0.5}
            y2={Math.round(b.y) + 0.5}
          />
        ))}
      </svg>
      {showGaps &&
        lines.map(({ g, a, b }) =>
          g.gap ? (
            <span
              key={`gap-${g.axis}-${g.at}`}
              className={styles.guideGap}
              aria-hidden="true"
              style={{ transform: `translate(${(a.x + b.x) / 2}px, ${(a.y + b.y) / 2}px)` }}
            >
              {gapText(g.gap)}
            </span>
          ) : null,
        )}
    </>,
    overlay,
  );
}
