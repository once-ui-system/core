"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, a calm teal brand and a strong red reserved for medical alerts.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0b6e6e" },
        error: { main: "#c62828", contrastText: "#ffffff" },
        background: { default: "#f3f6f7", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4fd1c5" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        background: { default: "#0e1416", paper: "#162023" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.125rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
