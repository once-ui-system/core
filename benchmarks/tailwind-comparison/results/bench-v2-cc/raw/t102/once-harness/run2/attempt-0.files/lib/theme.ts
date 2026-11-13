import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, applied once through the design system's theme provider.
export const style: OnceUIStyleConfig = {
  theme: "system", // keep "system" so the theme switch works
  defaultTheme: "light",
  brand: "custom",
  brandSeed: "#DB2777",
  accent: "magenta",
  neutral: "sand",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "rounded",
  surface: "filled",
  transition: "all",
  density: "spacious",
};
