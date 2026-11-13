import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, set once here and read by the ThemeProvider (app/providers.tsx)
// and by ThemeInit (app/layout.tsx), so every screen follows it.
export const style: OnceUIStyleConfig = {
  // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
  theme: "system",
  defaultTheme: "light",
  neutral: "slate", // cool slate grey
  brand: "custom",
  brandSeed: "#0F766E", // step 500: primary buttons, current nav item, links, focus rings
  accent: "cyan",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // small corner radius; fonts.css pins it to 2px
  surface: "filled",
  transition: "micro",
  density: "compact", // tight rows, small controls
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "flat",
  mode: "categorical",
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};
