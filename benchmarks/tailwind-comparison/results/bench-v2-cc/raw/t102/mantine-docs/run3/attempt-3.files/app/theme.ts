import {
  ActionIcon,
  AppShell,
  Button,
  Card,
  NavLink,
  PasswordInput,
  Select,
  TextInput,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from "@mantine/core";

// Lumen brand: #DB2777 sits on shade 6 of the "brand" palette.
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

// Warm sand neutrals. Also replaces the default gray so every neutral is warm.
const sand: MantineColorsTuple = [
  "#f8f3ea",
  "#f1e9dc",
  "#e7dccb",
  "#dbcdb7",
  "#d2c2a8",
  "#b5a285",
  "#8f7d62",
  "#6f6049",
  "#54483a",
  "#3a3128",
];

const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 6, dark: 6 },
  colors: { brand, sand, gray: sand },
  black: "#2b2118",
  white: "#ffffff",
  fontFamily: bodyFont,
  headings: {
    fontFamily: headingFont,
    fontWeight: "700",
    sizes: {
      h1: { fontSize: "2rem", lineHeight: "1.2" },
      h2: { fontSize: "1.5rem", lineHeight: "1.3" },
      h3: { fontSize: "1.25rem", lineHeight: "1.35" },
    },
  },
  defaultRadius: "md",
  radius: {
    xs: "0.375rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.75rem",
  },
  spacing: {
    xs: "0.625rem",
    sm: "0.875rem",
    md: "1.25rem",
    lg: "1.75rem",
    xl: "2.5rem",
  },
  components: {
    Button: {
      defaultProps: { size: "lg" },
      styles: { root: { fontWeight: 600 } },
    },
    ActionIcon: { defaultProps: { size: "xl" } },
    TextInput: { defaultProps: { size: "lg" } },
    PasswordInput: { defaultProps: { size: "lg" } },
    Select: { defaultProps: { size: "lg" } },
    Card: {
      defaultProps: { padding: "lg", withBorder: true, shadow: "xs" },
    },
    NavLink: {
      styles: {
        root: {
          minHeight: "3rem",
          borderRadius: "var(--mantine-radius-md)",
        },
        label: { fontSize: "var(--mantine-font-size-md)" },
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor:
            "light-dark(var(--mantine-color-sand-0), var(--mantine-color-dark-8))",
        },
      },
    },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    "--mantine-color-body": "#fffdfa",
    "--mantine-color-dimmed": "#6f6049",
  },
  dark: {},
});
