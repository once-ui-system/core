"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes (official Next.js App Router setup).
// System font stack: nothing is fetched from the network.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5e50", dark: "#1f4a3e", light: "#4f8472", contrastText: "#ffffff" },
        secondary: { main: "#9a4b32" },
        error: { main: "#c0332b" },
        warning: { main: "#b26a00" },
        success: { main: "#1f7a4d" },
        background: { default: "#f4f1ea", paper: "#ffffff" },
        text: { primary: "#1d2420", secondary: "#55605a" },
        divider: "#e0dbd0",
      },
    },
    dark: {
      palette: {
        primary: { main: "#86c9b1", dark: "#5fa68c", light: "#a9dcc9", contrastText: "#0d1a15" },
        secondary: { main: "#e0957a" },
        error: { main: "#ff8a80" },
        warning: { main: "#f2b04c" },
        success: { main: "#6fd3a1" },
        background: { default: "#12161a", paper: "#1b2026" },
        text: { primary: "#e9ece9", secondary: "#a4aea8" },
        divider: "#2c343b",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTab: { styleOverrides: { root: { minHeight: 48 } } },
  },
});

export default theme;
