"use client";

import {
  Badge,
  Button,
  Card,
  createTheme,
  Menu,
  NavLink,
  Select,
  Switch,
  Table,
  TextInput,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

// Brand pink: shade 6 is exactly #DB2777.
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

// Warm sand neutrals. Replaces the default gray so borders, dimmed text and
// surfaces all turn warm without touching individual components.
const sand: MantineColorsTuple = [
  "#faf7f2",
  "#f3eee4",
  "#e9e1d1",
  "#ddd1ba",
  "#cdbd9f",
  "#bba88a",
  "#a3906f",
  "#85734f",
  "#665740",
  "#3f352a",
];

const warmDark: MantineColorsTuple = [
  "#e6dfd2",
  "#c9bfae",
  "#ab9f8b",
  "#8d8272",
  "#6b6254",
  "#52493d",
  "#41392f",
  "#322c24",
  "#26211b",
  "#1b1712",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, sand, gray: sand, dark: warmDark },
  black: "#2b2219",
  white: "#ffffff",
  focusRing: "auto",
  cursorType: "pointer",

  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2.25rem", lineHeight: "1.15" },
      h2: { fontSize: "1.5rem", lineHeight: "1.25" },
      h3: { fontSize: "1.25rem", lineHeight: "1.3" },
    },
  },

  // 16px corners everywhere.
  defaultRadius: "md",
  radius: { xs: "0.5rem", sm: "0.75rem", md: "1rem", lg: "1.25rem", xl: "1.75rem" },

  // Airy density.
  spacing: { xs: "0.625rem", sm: "0.875rem", md: "1.25rem", lg: "1.75rem", xl: "2.5rem" },

  components: {
    Button: Button.extend({
      defaultProps: { size: "lg", fw: 600 },
    }),
    TextInput: TextInput.extend({
      defaultProps: { size: "lg" },
    }),
    Select: Select.extend({
      defaultProps: { size: "lg", allowDeselect: false },
    }),
    Switch: Switch.extend({
      defaultProps: { size: "lg" },
    }),
    Card: Card.extend({
      defaultProps: { padding: "lg", withBorder: true, radius: "md" },
    }),
    Badge: Badge.extend({
      defaultProps: { size: "lg", fw: 700 },
    }),
    Menu: Menu.extend({
      defaultProps: { shadow: "md", radius: "md" },
    }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: "md", horizontalSpacing: "lg" },
    }),
    NavLink: NavLink.extend({
      styles: {
        root: { minHeight: "3rem", borderRadius: "var(--mantine-radius-md)" },
        label: { fontSize: "var(--mantine-font-size-md)" },
      },
    }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    // Sand page background; cards and inputs stay white on top of it.
    "--mantine-color-body": "#fbf8f2",
    "--mantine-color-dimmed": "#665740",
    // Links: brand shade 7 keeps small link text above 4.5:1 on sand.
    "--mantine-color-anchor": "#be185d",
  },
  dark: {},
});
