"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes (official Next.js App Router setup).
// System font stack: no network font fetch.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5d63", contrastText: "#ffffff" },
        secondary: { main: "#a8612f" },
        error: { main: "#c2362b" },
        warning: { main: "#96590a" },
        success: { main: "#2e7d4f" },
        background: { default: "#f6f4ef", paper: "#ffffff" },
        text: { primary: "#1d2527", secondary: "#58636a" },
        divider: "#dcd8cf",
      },
    },
    dark: {
      palette: {
        primary: { main: "#7cc3c4", contrastText: "#0b1c1e" },
        secondary: { main: "#e0a070" },
        error: { main: "#ff8a7d" },
        warning: { main: "#f2b45c" },
        success: { main: "#6fcf97" },
        background: { default: "#12171a", paper: "#1a2125" },
        text: { primary: "#eceee9", secondary: "#a7b1b4" },
        divider: "#2f3a3f",
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.01em" },
    h2: { fontSize: "1.1rem", fontWeight: 700 },
    h3: { fontSize: "1rem", fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
  },
});

export default theme;
