import { Badge, Button, Card, createTheme, NavLink, Paper, Table, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #E8590C sits at shade 6, the primary shade in both colour schemes.
const brand: MantineColorsTuple = [
  "#fff4ec",
  "#ffe3d1",
  "#ffc7a1",
  "#fda66b",
  "#f58340",
  "#ee6c22",
  "#E8590C",
  "#c94a08",
  "#a63d07",
  "#823006",
];

// Warm stone neutrals. `dark` drives the dark surfaces (body is dark[7], text is dark[0]).
const stoneDark: MantineColorsTuple = [
  "#e7e5e4",
  "#c7c3c0",
  "#a8a29e",
  "#8a847f",
  "#6b6560",
  "#4a4541",
  "#383431",
  "#2a2725",
  "#201e1c",
  "#161412",
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

const mono = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const sans = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: { brand, dark: stoneDark, gray: stoneGray },
  autoContrast: true,
  luminanceThreshold: 0.22,
  fontFamily: sans,
  fontFamilyMonospace: mono,
  headings: {
    fontFamily: mono,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.25" },
      h2: { fontSize: "1.375rem", lineHeight: "1.3" },
      h3: { fontSize: "1.125rem", lineHeight: "1.35" },
      h4: { fontSize: "1rem", lineHeight: "1.4" },
    },
  },
  defaultRadius: "sm",
  radius: { xs: "4px", sm: "4px", md: "4px", lg: "4px", xl: "4px" },
  focusRing: "auto",
  components: {
    Button: Button.extend({ defaultProps: { fw: 600 } }),
    Card: Card.extend({ defaultProps: { withBorder: true, padding: "md" } }),
    Paper: Paper.extend({ defaultProps: { withBorder: true } }),
    Badge: Badge.extend({ defaultProps: { variant: "light" } }),
    NavLink: NavLink.extend({ defaultProps: { variant: "light", color: "brand" } }),
    Table: Table.extend({ defaultProps: { highlightOnHover: true, verticalSpacing: "sm" } }),
  },
});
