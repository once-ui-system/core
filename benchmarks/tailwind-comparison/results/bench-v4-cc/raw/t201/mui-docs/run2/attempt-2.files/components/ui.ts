export const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/** A translucent wash of a palette colour that follows light and dark mode. */
export const tint = (color: "error" | "warning" | "info" | "success" | "primary", percent: number): string =>
  `color-mix(in srgb, var(--mui-palette-${color}-main) ${percent}%, transparent)`;
