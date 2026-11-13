"use client";

import { createTheme } from "@mui/material/styles";

// Official Next.js App Router setup: CSS variables with light and dark schemes.
// System font stack, no network font fetch at build.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4a43b8" },
        secondary: { main: "#9a6b1f" },
        background: { default: "#f4f3ef", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#a29bff" },
        secondary: { main: "#e0b565" },
        background: { default: "#101119", paper: "#181a25" },
      },
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default theme;
