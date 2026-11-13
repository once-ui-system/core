"use client";

import { createTheme } from "@mui/material/styles";

// Calm teal clinic palette. Colors are picked so white (light) or near-black (dark)
// text on every filled status color keeps at least 4.5:1 contrast.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0f766e", contrastText: "#ffffff" },
        secondary: { main: "#475569" },
        error: { main: "#c62828", contrastText: "#ffffff" },
        warning: { main: "#b45309", contrastText: "#ffffff" },
        info: { main: "#0369a1", contrastText: "#ffffff" },
        success: { main: "#15803d", contrastText: "#ffffff" },
        background: { default: "#f1f5f4", paper: "#ffffff" },
        divider: "#d5dedc",
      },
    },
    dark: {
      palette: {
        primary: { main: "#2dd4bf", contrastText: "#06302b" },
        secondary: { main: "#94a3b8" },
        error: { main: "#d32f2f", contrastText: "#ffffff" },
        warning: { main: "#f59e0b", contrastText: "#1c1100" },
        info: { main: "#38bdf8", contrastText: "#04202e" },
        success: { main: "#4ade80", contrastText: "#052e13" },
        background: { default: "#0c1311", paper: "#141d1b" },
        divider: "#26332f",
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { minHeight: 40 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700 } },
    },
  },
});

export default theme;
