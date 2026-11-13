"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes. System font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0e6b66" },
        secondary: { main: "#3b5bdb" },
        info: { main: "#0b62a0" },
        error: { main: "#c62828" },
        warning: { main: "#8f3d06" },
        success: { main: "#2e7d32" },
        background: { default: "#f3f6f5", paper: "#ffffff" },
        divider: "#dbe3e1",
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5" },
        secondary: { main: "#8ea2ff" },
        error: { main: "#ff7b72" },
        warning: { main: "#f2b25c" },
        success: { main: "#6fcf7a" },
        background: { default: "#0f1716", paper: "#17211f" },
        divider: "#2a3835",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 750, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.125rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 650 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40, borderRadius: 10 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 40, minHeight: 40 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 650 } } },
  },
});

export default theme;
