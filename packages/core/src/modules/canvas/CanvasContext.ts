"use client";

import { createContext, useContext } from "react";
import type { CanvasPoint, CanvasRect, CanvasView } from "./geometry.js";

/**
 * What a canvas lets the things inside it do. Stable for the canvas's life,
 * so a component that only needs these never re-renders when the camera moves.
 */
export interface CanvasApi {
  /** The camera right now (read at call time, not at render). */
  getView: () => CanvasView;
  setView: (next: CanvasView | ((prev: CanvasView) => CanvasView)) => void;
  /** The canvas's size on screen, in px. */
  getSize: () => { width: number; height: number };
  /** A point in px from the canvas's top-left corner, as a world point. */
  screenToWorld: (p: CanvasPoint) => CanvasPoint;
  worldToScreen: (p: CanvasPoint) => CanvasPoint;
  /** A pointer event's `clientX` / `clientY`, as a world point. */
  clientToWorld: (clientX: number, clientY: number) => CanvasPoint;
  /** Zooms by `factor` around a screen point (the centre by default). */
  zoomBy: (factor: number, at?: CanvasPoint) => void;
  /** Zooms to `zoom` (1 = 100%) around a screen point (the centre by default). */
  zoomTo: (zoom: number, at?: CanvasPoint) => void;
  /** Frames `rect`; with nothing given, the canvas's `fit` box. */
  fitTo: (rect?: CanvasRect | null, options?: { padding?: number; maxZoom?: number }) => void;
  /** The screen-space layer that handles, guides and anchors draw into. */
  overlay: HTMLElement | null;
}

export const CanvasApiContext = createContext<CanvasApi | null>(null);
export const CanvasViewContext = createContext<CanvasView>({ x: 0, y: 0, zoom: 1 });

/** The canvas's camera controls, without re-rendering when the camera moves. */
export function useCanvasApi(): CanvasApi {
  const api = useContext(CanvasApiContext);
  if (!api) throw new Error("useCanvasApi must be used inside <Canvas>.");
  return api;
}

/**
 * The canvas's camera and its controls. A component that calls this re-renders
 * on every pan and zoom, so keep it to what is drawn in screen space; world
 * content goes in `CanvasItem`s, which never need to.
 */
export function useCanvas(): CanvasApi & { view: CanvasView } {
  const api = useCanvasApi();
  const view = useContext(CanvasViewContext);
  return { ...api, view };
}
