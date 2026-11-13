"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type * as Three from "three";
import type { SceneColor } from "./types.js";

type ThreeModule = typeof import("three");

/** One frame: seconds since the last one, and since the scene started. */
export interface SceneFrame {
  delta: number;
  elapsed: number;
}

export interface SceneContextValue {
  /**
   * The loaded `three` module. Meshes, labels and models build their objects
   * from it, so only Scene.impl imports the package and an app that never
   * renders a scene never resolves it.
   */
  three: ThreeModule;
  scene: Three.Scene;
  camera: Three.PerspectiveCamera;
  renderer: Three.WebGLRenderer;
  /** The element the canvas and labels sit in. */
  container: HTMLDivElement;
  /** Draw one more frame. Call it after changing anything outside a frame callback. */
  invalidate: () => void;
  /** A scene colour as a `THREE.Color` (and its alpha), in the scene's current theme. */
  color: (color: SceneColor) => { color: Three.Color; alpha: number };
  /**
   * Bumps whenever the theme around the scene changes (light/dark, brand,
   * accent, neutral), so anything holding a token colour re-reads it.
   */
  themeVersion: number;
  /** The theme the scene is drawn in. */
  theme: "light" | "dark";
  /** True when motion is reduced: no turntable and no per-frame animation. */
  reducedMotion: boolean;
  /**
   * Runs `callback` before every frame while the scene animates. Returns the
   * unsubscribe function. Prefer `useSceneFrame`.
   */
  onFrame: (callback: (frame: SceneFrame) => void) => () => void;
  /** Registers a clickable object; returns the unregister function. */
  addPickable: (object: Three.Object3D, handlers: ScenePointerHandlers) => () => void;
  /** Loads a glTF or GLB file, cached per URL. */
  loadModel: (src: string) => Promise<Three.Object3D>;
}

export interface ScenePointerHandlers {
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

export const SceneContext = createContext<SceneContextValue | null>(null);

/** The object new children attach to: the scene itself, or a group or mesh above them. */
export const SceneParentContext = createContext<Three.Object3D | null>(null);

/**
 * The scene these components sit in. Throws outside a `<Scene>`, so a mesh
 * placed elsewhere fails where it is written instead of drawing nothing.
 */
export function useScene(): SceneContextValue {
  const context = useContext(SceneContext);
  if (!context) throw new Error("useScene must be used inside <Scene>");
  return context;
}

/** The object children of the current component attach to. */
export function useSceneParent(): Three.Object3D {
  const { scene } = useScene();
  return useContext(SceneParentContext) ?? scene;
}

/**
 * Runs `callback` before every frame, for animation: spin a part, follow a
 * value. While at least one frame callback is mounted the scene draws
 * continuously (when it is on screen and the tab is visible); with reduced
 * motion it draws only on demand, and callbacks run once per drawn frame.
 *
 * @example
 * const head = useRef<Object3D>(null);
 * useSceneFrame(({ elapsed }) => {
 *   if (head.current) head.current.rotation.y = Math.sin(elapsed) * 0.4;
 * });
 */
export function useSceneFrame(callback: (frame: SceneFrame) => void): void {
  const { onFrame } = useScene();
  const latest = useRef(callback);
  latest.current = callback;
  useEffect(() => onFrame((frame) => latest.current(frame)), [onFrame]);
}
