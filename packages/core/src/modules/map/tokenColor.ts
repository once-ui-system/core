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
