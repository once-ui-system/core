import { Card, createTheme, Paper, type MantineColorsTuple } from "@mantine/core";

// Lumen brand orange: shade 6 is exactly #E8590C.
const brand: MantineColorsTuple = [
  "#fff3eb",
  "#ffe3d1",
  "#fdc9a4",
  "#fbab74",
  "#f78c47",
  "#f0711f",
  "#E8590C",
  "#c94a08",
  "#a83e08",
  "#8a3407",
];

// Warm stone neutrals. Dark mode reads body background from dark[7], text from dark[0].
const stoneDark: MantineColorsTuple = [
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#8b847e",
  "#57534e",
  "#44403c",
  "#2b2724",
  "#1c1917",
  "#171412",
  "#0c0a09",
];

const stoneGray: MantineColorsTuple = [
  "#fafaf9",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
];

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, dark: stoneDark, gray: stoneGray },
  // The brand orange is too light for white text at small sizes; pick dark text on filled surfaces.
  autoContrast: true,
  luminanceThreshold: 0.2,
  black: "#1c1917",
  fontFamily: SANS,
  fontFamilyMonospace: MONO,
  headings: { fontFamily: MONO, fontWeight: "600" },
  defaultRadius: "xs",
  radius: { xs: "4px", sm: "4px", md: "4px", lg: "4px", xl: "4px" },
  components: {
    Card: Card.extend({ defaultProps: { withBorder: true, padding: "md" } }),
    Paper: Paper.extend({ defaultProps: { withBorder: true } }),
  },
});
