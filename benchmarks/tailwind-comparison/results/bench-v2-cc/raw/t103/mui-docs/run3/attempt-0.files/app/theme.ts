"use client";

import { createTheme } from "@mui/material/styles";

const SANS = "ui-sans-serif, system-ui, sans-serif";
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const BRAND = "#E8590C";
const BRAND_DARK = "#C2410C";
const BRAND_LIGHT = "#F97316";
const ON_BRAND = "#1C1917";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" };

// Lumen: a control room for engineers. Brand orange on warm stone neutrals,
// 4px corners, monospace headings, dark by default.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: BRAND, light: BRAND_LIGHT, dark: BRAND_DARK, contrastText: ON_BRAND },
        background: { default: "#1C1917", paper: "#292524" },
        divider: "#44403C",
        text: { primary: "#FAFAF9", secondary: "#A8A29E" },
        grey: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
      },
    },
    light: {
      palette: {
        primary: { main: BRAND, light: BRAND_LIGHT, dark: BRAND_DARK, contrastText: ON_BRAND },
        background: { default: "#FAFAF9", paper: "#FFFFFF" },
        divider: "#D6D3D1",
        text: { primary: "#1C1917", secondary: "#57534E" },
        grey: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
      },
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: { ...heading, fontSize: "2rem" },
    h2: { ...heading, fontSize: "1.75rem" },
    h3: { ...heading, fontSize: "1.5rem" },
    h4: { ...heading, fontSize: "1.375rem" },
    h5: { ...heading, fontSize: "1.125rem" },
    h6: { ...heading, fontSize: "1rem" },
    overline: { fontFamily: MONO, letterSpacing: "0.08em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiLink: { defaultProps: { underline: "always" } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&:focus-visible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => {
          const p = (t.vars || t).palette.primary;
          return {
            "&.Mui-selected": {
              backgroundColor: p.main,
              color: p.contrastText,
              "&:hover": { backgroundColor: p.dark },
            },
            "&.Mui-focusVisible": {
              outline: `2px solid ${p.main}`,
              outlineOffset: 2,
            },
          };
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: MONO, fontSize: "0.75rem", letterSpacing: "0.04em", textTransform: "uppercase" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontFamily: MONO, fontSize: "0.75rem" } } },
  },
});

export default theme;
