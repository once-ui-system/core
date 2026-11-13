import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's visual identity, expressed once through the design system's own theme
// options. ThemeInit (root layout) and ThemeProvider (providers) both read it.
export const style: OnceUIStyleConfig = {
  // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
  theme: "system",
  defaultTheme: "dark",
  neutral: "sand", // warm stone grey
  brand: "custom",
  brandSeed: "#E8590C", // step 500: primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#E8590C",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "conservative", // small corners (4px, see app/fonts.css)
  surface: "filled",
  transition: "micro",
  scaling: "100",
  density: "normal",
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "flat",
  mode: "categorical",
};
