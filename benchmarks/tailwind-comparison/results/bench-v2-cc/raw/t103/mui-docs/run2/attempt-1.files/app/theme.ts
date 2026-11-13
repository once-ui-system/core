"use client";

import { createTheme } from "@mui/material/styles";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";
const BRAND = "#E8590C";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" } as const;

// Lumen: technical and focused. Brand orange on warm stone neutrals, 4px corners,
// monospace headings. Everything is carried by tokens, not per-element styles.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND, dark: "#C2410C", contrastText: "#1c1917" },
        background: { default: "#fafaf9", paper: "#ffffff" },
        text: { primary: "#1c1917", secondary: "#57534e" },
        divider: "#e7e5e4",
        grey: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: BRAND, dark: "#C2410C", light: "#F4722B", contrastText: "#1c1917" },
        background: { default: "#1c1917", paper: "#262321" },
        text: { primary: "#fafaf9", secondary: "#a8a29e" },
        divider: "#44403c",
        grey: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: { ...heading, fontSize: "2rem" },
    h2: { ...heading, fontSize: "1.625rem" },
    h3: { ...heading, fontSize: "1.375rem" },
    h4: { ...heading, fontSize: "1.25rem" },
    h5: { ...heading, fontSize: "1.0625rem" },
    h6: { ...heading, fontSize: "0.9375rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: "2px",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: { "&:hover": { backgroundColor: "#F4722B" } },
        },
      ],
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme: t }) => ({
          color: "var(--mui-palette-primary-main)",
          ...t.applyStyles("light", { color: "#C2410C" }),
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-selected": {
            color: "var(--mui-palette-primary-main)",
            backgroundColor: "rgba(232, 89, 12, 0.16)",
            "&:hover": { backgroundColor: "rgba(232, 89, 12, 0.24)" },
            ...t.applyStyles("light", { color: "#C2410C" }),
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: MONO, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" },
      },
    },
  },
});

export default theme;
