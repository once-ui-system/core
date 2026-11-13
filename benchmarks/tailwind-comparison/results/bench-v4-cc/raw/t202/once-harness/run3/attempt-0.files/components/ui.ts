import type { CSSProperties } from "react";

export const C = {
  surface: "var(--surface-background, #fff)",
  page: "var(--page-background, #f6f6f6)",
  text: "var(--neutral-on-background-strong, currentColor)",
  textWeak: "var(--neutral-on-background-weak, currentColor)",
  line: "var(--neutral-alpha-medium, rgba(128,128,128,0.3))",
  lineWeak: "var(--neutral-alpha-weak, rgba(128,128,128,0.15))",
  lineStrong: "var(--neutral-alpha-strong, rgba(128,128,128,0.5))",
  brand: "var(--brand-solid-strong, currentColor)",
  brandBg: "var(--brand-background-strong, transparent)",
  brandOn: "var(--brand-on-background-strong, currentColor)",
  brandTint: "color-mix(in srgb, var(--brand-solid-strong, currentColor) 14%, transparent)",
  danger: "var(--danger-solid-strong, currentColor)",
  dangerTint: "color-mix(in srgb, var(--danger-solid-strong, currentColor) 12%, transparent)",
  warning: "var(--warning-solid-strong, currentColor)",
  success: "var(--success-solid-strong, currentColor)",
  accent: "var(--accent-solid-strong, currentColor)",
} as const;

export const resetButton: CSSProperties = {
  font: "inherit",
  color: "inherit",
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
  textAlign: "left",
};
