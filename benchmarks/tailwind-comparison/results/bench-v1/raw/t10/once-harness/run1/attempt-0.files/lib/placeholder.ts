import type { CSSProperties } from "react";

/** Deterministic CSS-drawn "photo": gradient sky, sun and a skyline silhouette. */
export function placeholderStyle(id: string, shift = 0): CSSProperties {
  const n = Number(id.replace(/\D/g, "")) + shift * 37;
  const hue = (n * 47) % 360;
  const hue2 = (hue + 40 + (n % 5) * 10) % 360;
  const sunX = 18 + ((n + shift * 3) % 5) * 15;
  return {
    backgroundImage: [
      `radial-gradient(circle at ${sunX}% 28%, hsla(${hue2}, 90%, 90%, 0.95) 0 9%, transparent 10%)`,
      `linear-gradient(180deg, transparent 0 62%, hsla(${hue}, 35%, 22%, 0.55) 62% 100%)`,
      `linear-gradient(160deg, hsl(${hue}, 48%, 66%) 0%, hsl(${hue2}, 52%, 42%) 100%)`,
    ].join(", "),
  };
}
