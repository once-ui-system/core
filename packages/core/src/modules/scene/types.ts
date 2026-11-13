import type { ColorScheme, ColorWeight } from "../../types.js";

/** A point or a size in scene units: `[x, y, z]`. Y is up. */
export type Vec3 = readonly [number, number, number];

/**
 * A colour for a material or a light.
 *
 * - A token pair, `"brand-strong"` or `"neutral-weak"`: that tone's hue,
 *   full strength for `strong` and lighter for `medium` and `weak`
 *   (`--function-brand-500`, `-700`, `-900`), read where the scene sits, so
 *   it follows the brand, accent and neutral chosen around it. Lights,
 *   shadow and grid follow light and dark.
 * - A CSS custom property, `"--page-background"`.
 * - Any CSS colour, `"#ff8800"` or `"rgb(0 0 0)"`.
 */
export type SceneColor = `${ColorScheme}-${ColorWeight}` | `--${string}` | (string & {});

/** Where the camera starts and what it looks at. */
export interface SceneCamera {
  /** Default `[4, 3, 5]`. */
  position?: Vec3;
  /** The point the camera looks at and orbits around. Default `[0, 0.5, 0]`. */
  target?: Vec3;
  /** Vertical field of view in degrees. Default 40. */
  fov?: number;
}

/**
 * How people move the camera.
 *
 * - `"orbit"`: drag to rotate, scroll or pinch to zoom, arrows to pan.
 * - `"turntable"`: the scene turns slowly on its own and drag rotates it; it
 *   stands still when motion is reduced.
 * - `"none"`: a fixed camera.
 */
export type SceneControls = "orbit" | "turntable" | "none";

/**
 * The light rig.
 *
 * - `"studio"`: a soft sky and ground fill, a key light that casts the floor
 *   shadow, and a rim light in the brand colour.
 * - `"neutral"`: the same without the brand rim.
 * - `"none"`: no lights, for scenes that add their own (`useScene().scene`).
 */
export type SceneLighting = "studio" | "neutral" | "none";

/** Primitive shapes for `<SceneMesh>`. */
export type SceneGeometry =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "capsule"
  | "torus"
  | "plane"
  | "circle"
  | "ring";
