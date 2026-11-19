/**
 * A design token as an `rgb()` string MapLibre can paint. Layer paint takes
 * plain colours, not CSS variables, and the tokens compute to `lab()` or
 * `color-mix()`, which MapLibre does not parse. A 1px canvas converts
 * whatever the browser resolves.
 */
export function tokenColor(variable: string, fallback = "rgb(128, 128, 128)"): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  if (!value) return fallback;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return fallback;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

/**
 * The fill and ink variables of a map tone. The brand is its colour step, not
 * `--brand-solid-strong`: with `solid="contrast"` that is the neutral ink
 * (white on dark, grey on light), so brand pins and areas lost their colour.
 */
export function toneVars(tone: string): { solid: string; onSolid: string } {
  if (tone === "brand") return { solid: "--function-brand-500", onSolid: "--static-white" };
  return { solid: `--${tone}-solid-strong`, onSolid: `--${tone}-on-solid-strong` };
}
