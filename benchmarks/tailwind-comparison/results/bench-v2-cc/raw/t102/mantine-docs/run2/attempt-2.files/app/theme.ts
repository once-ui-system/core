import { createTheme, rem } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

// Lumen brand colour #DB2777 sits at shade 6 (the primary shade).
const brand: MantineColorsTuple = [
  "#fdf2f8",
  "#fce7f3",
  "#fbcfe8",
  "#f9a8d4",
  "#f472b6",
  "#ec4899",
  "#db2777",
  "#be185d",
  "#9d174d",
  "#831843",
];

// Warm sand neutrals; replacing `gray` makes borders, dimmed text and defaults warm.
const sand: MantineColorsTuple = [
  "#faf7f2",
  "#f3eee6",
  "#e9e1d4",
  "#dcd0bd",
  "#c4b69d",
  "#a99a7e",
  "#7a6d58",
  "#5f5443",
  "#463d31",
  "#2f2923",
];

// Plain-object component defaults (no `.extend`) so the theme stays serialisable
// and can be imported from the server root layout.
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 5 },
  colors: { brand, sand, gray: sand },
  black: "#2f2923",
  white: "#ffffff",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    fontWeight: "700",
  },
  defaultRadius: "md",
  radius: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(20), xl: rem(28) },
  // Airy density: generous spacing.
  spacing: { xs: rem(12), sm: rem(16), md: rem(24), lg: rem(32), xl: rem(48) },
  components: {
    Button: { defaultProps: { size: "md", radius: "md" } },
    TextInput: { defaultProps: { size: "md", radius: "md" } },
    Select: { defaultProps: { size: "md", radius: "md" } },
    Switch: { defaultProps: { size: "lg" } },
    SegmentedControl: { defaultProps: { size: "md", radius: "md" } },
    Card: { defaultProps: { radius: "md", padding: "lg", withBorder: true } },
    Paper: { defaultProps: { radius: "md" } },
    Menu: { defaultProps: { radius: "md", shadow: "md" } },
    Badge: { defaultProps: { size: "lg", variant: "light" } },
  },
});
