import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, applied once through the design system's ThemeProvider.
export const style: OnceUIStyleConfig = {
  theme: "system", // stays "system" so the theme switch works
  defaultTheme: "dark", // what a first visit sees
  neutral: "sand", // warm stone grey
  brand: "custom",
  brandSeed: "#E8590C", // primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#E8590C",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "conservative", // small corner radius; exact 4px set in app/fonts.css
  surface: "filled",
  transition: "micro",
  scaling: "100",
  density: "normal",
};
