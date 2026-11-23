"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import styles from "./Magnitude.module.css";

/** What a mark's hover card says: a title and a line per fact. */
export interface ChartCardContent {
  title: string;
  lines: string[];
}

/**
 * The hover card Treemap, Heatmap and DivergingBars share: a small card that
 * follows the pointer, or sits on the focused mark for keyboard readers, kept
 * inside the chart's box.
 *
 * Internal: not exported from the data barrel.
 */
export function useHoverCard(enabled = true) {
  const box = useRef<HTMLDivElement>(null);
  const [card, setCard] = useState<(ChartCardContent & { x: number; y: number }) | null>(null);

  const place = useCallback((content: ChartCardContent, clientX: number, clientY: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max(clientX - rect.left + 12, 0), Math.max(rect.width - 200, 0));
    setCard({ ...content, x, y: clientY - rect.top + 16 });
  }, []);

  const handlers = (content: ChartCardContent) =>
    enabled
      ? {
          onMouseMove: (event: React.MouseEvent) => place(content, event.clientX, event.clientY),
          onMouseLeave: () => setCard(null),
          onFocus: (event: React.FocusEvent<HTMLElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            place(content, rect.left + rect.width / 2, rect.top + rect.height / 2);
          },
          onBlur: () => setCard(null),
        }
      : {};

  const layer: ReactNode = card ? (
    <div className={styles.card} style={{ left: card.x, top: card.y }} aria-hidden="true">
      <div className={styles.cardTitle}>{card.title}</div>
      {card.lines.map((line) => (
        <div key={line} className={styles.cardLine}>
          {line}
        </div>
      ))}
    </div>
  ) : null;

  return { box, handlers, layer };
}

/** A mark's accessible name: what its card says, on one line. */
export const cardLabel = ({ title, lines }: ChartCardContent) =>
  lines.length ? `${title}: ${lines.join(", ")}` : title;

/** A formatter that writes gains with their sign, so a gain reads as one without colour: "+12%". */
export const withSign =
  (format: (value: number) => string) =>
  (value: number): string => {
    const text = format(value);
    return value > 0 && !/^[+\-−]/.test(text) ? `+${text}` : text;
  };
