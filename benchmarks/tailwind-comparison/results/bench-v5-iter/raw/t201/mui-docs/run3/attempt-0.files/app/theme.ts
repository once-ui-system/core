"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes; system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0f6b6b" },
        secondary: { main: "#4a5a8a" },
        error: { main: "#c62828" },
        warning: { main: "#b45309" },
        background: { default: "#f3f6f6", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fc3c3" },
        secondary: { main: "#9db0ee" },
        error: { main: "#ff8a80" },
        warning: { main: "#ffb74d" },
        background: { default: "#0e1516", paper: "#162022" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    h3: { fontSize: "1.05rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { minHeight: 44, textTransform: "none", fontWeight: 600 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
