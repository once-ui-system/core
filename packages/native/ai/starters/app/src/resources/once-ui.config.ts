import type { ThemeProviderProps } from "@once-ui-system/native";

// The same options, names and values as a web app's src/resources/once-ui.config.ts.
// When the app also has a web build, both take `style` from one shared package
// (see this package's AGENTS.md), so a brand change in one place reaches both.
export const style: Omit<ThemeProviderProps, "children" | "insets" | "fonts"> = {
  theme: "system", // follows the phone's light or dark setting
  defaultTheme: "dark", // used when the phone reports neither
  neutral: "gray", // sand | gray | slate | rose | mint | dusk
  brand: "blue", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "indigo", // same names as brand
  solid: "contrast", // primary buttons: color = brand colour, contrast = black/white whatever the brand, inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};
