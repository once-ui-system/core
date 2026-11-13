"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes. Palette chosen for contrast: status and alert colours
// stay readable at counter distance in both modes. System font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6b66" },
        secondary: { main: "#3d4f7c" },
        info: { main: "#0b5cad" },
        success: { main: "#1b6e3c" },
        warning: { main: "#8a4b00" },
        error: { main: "#b3261e" },
        background: { default: "#f2f6f5", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#5fd3c8" },
        secondary: { main: "#a9b8e8" },
        info: { main: "#8ab8ff" },
        success: { main: "#7bd69a" },
        warning: { main: "#ffb454" },
        error: { main: "#ff8f87" },
        background: { default: "#0e1514", paper: "#162120" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default theme;
