"use client";

import { createTheme } from "@mui/material/styles";

// Pawpoint: calm teal clinic palette, large touch targets, strong red reserved for medical alerts.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6b6b", contrastText: "#ffffff" },
        secondary: { main: "#4b3fa3" },
        error: { main: "#b91c1c", contrastText: "#ffffff" },
        warning: { main: "#9a4a00", contrastText: "#ffffff" },
        success: { main: "#1b6e34", contrastText: "#ffffff" },
        info: { main: "#0b58a0", contrastText: "#ffffff" },
        background: { default: "#f2f5f5", paper: "#ffffff" },
        text: { primary: "#14211f", secondary: "#4a5b58" },
        divider: "#d9e2e1",
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5", contrastText: "#052321" },
        secondary: { main: "#b4a9ff" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        warning: { main: "#f5a524", contrastText: "#1d1200" },
        success: { main: "#5fd38a", contrastText: "#062012" },
        info: { main: "#7cc0ff", contrastText: "#041a30" },
        background: { default: "#0e1415", paper: "#162022" },
        text: { primary: "#e8f0ef", secondary: "#a2b4b1" },
        divider: "#2a3a3b",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
