"use client";

import { Column } from "@once-ui-system/core";
import { type ReactNode, useEffect, useRef } from "react";
import { usePreviewSelection } from "./PreviewRoot.js";

/**
 * One section in the preview: clickable to select, outlined while selected
 * (and faintly while its tile is hovered), scrolled into view when the editor
 * selects it. Outside the editor it renders its children and nothing else.
 */
export function PreviewSection({ id, children }: { id: string; children: ReactNode }) {
  const { selectedId, hoveredId, editing, select } = usePreviewSelection();
  const ref = useRef<HTMLDivElement>(null);
  const selected = selectedId === id;
  const hovered = hoveredId === id;

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  if (!editing) return <>{children}</>;

  return (
    <Column
      ref={ref}
      fillWidth
      data-section-id={id}
      cursor="interactive"
      transition="micro-medium"
      onClick={() => select(id)}
      style={{
        outline:
          selected || hovered
            ? `2px solid var(--brand-${selected ? "on-background-medium" : "border-medium"})`
            : "2px solid transparent",
        outlineOffset: "8px",
        borderRadius: "var(--radius-m)",
      }}
    >
      {children}
    </Column>
  );
}
