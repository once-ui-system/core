"use client";

import { createTheme } from "@mui/material/styles";

// CSS variables with light and dark schemes, system font stack (no network fonts).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2f5d50" },
        secondary: { main: "#b4532a" },
        background: { default: "#f5f3ee", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#8fc3ae" },
        secondary: { main: "#e29a73" },
        background: { default: "#111619", paper: "#1a2125" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
