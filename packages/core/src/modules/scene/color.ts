import type { SceneColor } from "./types.js";

const TOKEN_PAIR =
  /^(neutral|brand|accent|info|danger|warning|success)-(alpha-)?(weak|medium|strong)$/;

let probe: CanvasRenderingContext2D | null | undefined;

function context(): CanvasRenderingContext2D | null {
  if (probe !== undefined) return probe;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  probe = canvas.getContext("2d", { willReadFrequently: true });
  return probe;
}

/**
 * The scale step each weight reads. Materials take the tone's own hue scale
 * (`--function-brand-500`), not its solid token: `data-solid="contrast"`
 * turns brand solids black or white, and an object in a scene keeps its
 * colour while the lights and floor follow light and dark.
 */
const STEP = { strong: 500, medium: 700, weak: 900 } as const;

/** The CSS custom property a scene colour reads, or null for a plain CSS colour. */
export function sceneColorVariable(color: SceneColor): string | null {
  if (color.startsWith("--")) return color;
  const match = TOKEN_PAIR.exec(color);
  if (!match) return null;
  const [, tone, alpha, weight] = match;
  if (alpha) return `--${tone}-alpha-${weight}`;
  return `--function-${tone}-${STEP[weight as keyof typeof STEP]}`;
}

/**
 * A scene colour as sRGB channels from 0 to 1 and an alpha, resolved in the
 * theme `element` is drawn in. Tokens compute to `lab()` or `color-mix()`,
 * which WebGL cannot take, so a 1px canvas converts whatever the browser
 * resolved. Unknown colours come back as a mid grey.
 */
export function resolveSceneColor(
  color: SceneColor,
  element: Element | null,
): { r: number; g: number; b: number; a: number } {
  const grey = { r: 0.5, g: 0.5, b: 0.5, a: 1 };
  if (typeof window === "undefined") return grey;
  const variable = sceneColorVariable(color);
  let value: string = color;
  if (variable) {
    const source = element ?? document.documentElement;
    value = getComputedStyle(source).getPropertyValue(variable).trim();
    if (!value) return grey;
  }
  const ctx = context();
  if (!ctx) return grey;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "#808080";
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return { r: r / 255, g: g / 255, b: b / 255, a: a / 255 };
}
