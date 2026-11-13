"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2b5f5a" },
        secondary: { main: "#a84e2c" },
        background: { default: "#f5f2ec", paper: "#ffffff" },
        text: { primary: "#1d2625", secondary: "#55605e" },
        divider: "#ddd8cd",
      },
    },
    dark: {
      palette: {
        primary: { main: "#7cc3bb" },
        secondary: { main: "#e39a74" },
        background: { default: "#111617", paper: "#1a2123" },
        text: { primary: "#e8ecea", secondary: "#a2aeab" },
        divider: "#2c3638",
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

export default theme;
