import type { ReactNode } from "react";

/**
 * A named look for the native cursor: the arrow, the pointer over controls,
 * the I-beam over text fields and the blocked sign over disabled ones, drawn
 * by the browser itself from the stylesheet (`data-cursor`).
 *
 * - `soft`: a dark wedge with a white rim and a soft shadow, the same in both themes.
 * - `rounded`: the classic arrow, rounded off, light in dark mode.
 * - `dot`: a small dot that opens into a ring over anything clickable.
 */
export type CursorPreset = "soft" | "rounded" | "dot";

/** A preset, or `"system"` for the browser's own cursors (turns a preset off below it). */
export type CursorPresetValue = CursorPreset | "system";

export const cursorPresets: readonly CursorPresetValue[] = ["soft", "rounded", "dot", "system"];

/** The `cursor` values foundations writes as classes (`.cursor-*`). */
const CURSOR_CLASSES = new Set([
  "interactive",
  "pointer",
  "default",
  "text",
  "move",
  "not-allowed",
  "wait",
  "help",
  "grab",
  "grabbing",
  "zoom-in",
  "zoom-out",
]);

export const isCursorPreset = (cursor: unknown): cursor is CursorPresetValue =>
  typeof cursor === "string" && (cursorPresets as readonly string[]).includes(cursor);

/** A node to follow the pointer, rather than a keyword or a preset. */
export const isCursorNode = (cursor: unknown): cursor is Exclude<ReactNode, string> =>
  typeof cursor === "object" && cursor !== null;

/**
 * How a layout primitive writes its `cursor` prop: a class when foundations
 * has one (so a preset can restyle it), `data-cursor` for a preset, and an
 * inline style only for a keyword with no class. An inline `cursor: pointer`
 * would outrank the preset's pointer.
 */
export function cursorProps(cursor: unknown): {
  className?: string;
  style?: string;
  attributes: { "data-cursor"?: CursorPresetValue };
} {
  if (typeof cursor !== "string" || cursor === "") return { attributes: {} };
  if (isCursorPreset(cursor)) return { attributes: { "data-cursor": cursor } };
  if (CURSOR_CLASSES.has(cursor)) return { className: `cursor-${cursor}`, attributes: {} };
  return { style: cursor, attributes: {} };
}
