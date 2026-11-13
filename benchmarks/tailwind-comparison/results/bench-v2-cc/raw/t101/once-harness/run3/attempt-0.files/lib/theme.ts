import type { OnceUIStyleConfig } from "@once-ui-system/core";

// Lumen's identity, carried through the design system's theme options once.
export const style: OnceUIStyleConfig = {
  theme: "system",
  defaultTheme: "light", // light on a first visit; the visitor can still switch
  neutral: "slate", // cool slate grey
  brand: "custom",
  brandSeed: "#0F766E", // step 500: primary buttons, current nav item, links, focus rings
  accent: "custom",
  accentSeed: "#0F766E",
  solid: "color", // primary buttons take the brand colour
  solidStyle: "flat",
  border: "sharp", // smallest corners; the exact 2px is set on the radius tokens in fonts.css
  surface: "filled",
  transition: "micro",
  density: "compact", // tight rows, small controls
};
