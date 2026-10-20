import type { OnceUIDataStyleConfig, OnceUIStyleConfig } from "@once-ui-system/core";

export const style: OnceUIStyleConfig = {
  // "dark" or "light" here locks the theme and the top-bar switch stops working.
  // Keep "system" and pick what a first visit sees with defaultTheme.
  theme: "system",
  defaultTheme: "dark", // dark | light | system
  neutral: "gray", // sand | gray | slate | rose | mint | dusk
  brand: "blue", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan
  accent: "indigo", // same names as brand
  solid: "contrast", // color | contrast | inverse
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "filled", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

export const dataStyle: OnceUIDataStyleConfig = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};
