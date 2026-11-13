import { defineConfig } from "@once-ui-system/core/config";

/**
 * Lumen's visual identity, expressed once through the design system's own
 * theming. `ThemeInit` (root layout) paints it before first paint and
 * `ThemeProvider` (providers.tsx) keeps it in sync on the client.
 */
export const { style, dataStyle } = defineConfig({
  style: {
    // "system" keeps the theme switch working; defaultTheme is what a first visit sees.
    theme: "system",
    defaultTheme: "light",

    // Cool slate neutrals; brand is Lumen teal (#0F766E), set exactly via a scale.
    neutral: "slate",
    brand: "custom",
    accent: "cyan",
    brandSeed: "#0F766E",
    brandScale: {
      light: {
        100: "#F0FDFA",
        200: "#CCFBF1",
        300: "#99F6E4",
        400: "#5EEAD4",
        500: "#2DD4BF",
        600: "#0F766E",
        700: "#0D6B64",
        800: "#115E59",
        900: "#134E4A",
        1000: "#0F3F3C",
        1100: "#0A2F2D",
        1200: "#052120",
      },
      dark: {
        100: "#052120",
        200: "#0A2F2D",
        300: "#0F3F3C",
        400: "#134E4A",
        500: "#115E59",
        600: "#14B8A6",
        700: "#2DD4BF",
        800: "#5EEAD4",
        900: "#99F6E4",
        1000: "#CCFBF1",
        1100: "#E6FDF8",
        1200: "#F0FDFA",
      },
    },

    // Flat solids, ledger-like hairline borders.
    solid: "color",
    solidStyle: "flat",
    // "sharp" is the system's tightest corner style; the radius tokens in
    // fonts.css pin every corner to 2px.
    border: "sharp",
    surface: "filled",
    transition: "micro",

    // Compact: tight rows, small controls, information-dense.
    density: "compact",
    scaling: "95",

    pageBackground: { light: "#F1F5F9", dark: "#0B1220" },
    surfaceBackground: { light: "#FFFFFF", dark: "#111A2B" },
  },
  dataStyle: {
    variant: "flat",
    mode: "categorical",
    height: 20,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
});
