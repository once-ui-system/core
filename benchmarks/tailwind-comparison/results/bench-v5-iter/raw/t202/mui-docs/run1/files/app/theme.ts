"use client";

import { createTheme } from "@mui/material/styles";

// Colours the floor plan and guest dots use. They live in the theme so both colour schemes can
// restyle them and nothing else in the app carries a raw colour.
interface PlanPalette {
  floor: string;
  wall: string;
  grid: string;
  tableFill: string;
  tableStroke: string;
  stage: string;
  stageText: string;
  dance: string;
  danceLine: string;
  bar: string;
  door: string;
  seatEmpty: string;
  text: string;
  muted: string;
  diet: string;
}

interface PartyPalette {
  couple: string;
  bride: string;
  groom: string;
  university: string;
  work: string;
  football: string;
  plusones: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    plan: PlanPalette;
    party: PartyPalette;
  }
  interface PaletteOptions {
    plan?: PlanPalette;
    party?: PartyPalette;
  }
}

// Party colours are mid-dark so white initials stay readable in both schemes.
const party: PartyPalette = {
  couple: "#a3234f",
  bride: "#1f6f8b",
  groom: "#7a4eab",
  university: "#a85a00",
  work: "#2e7d4f",
  football: "#3a4bb0",
  plusones: "#5f6b73",
};

// Seatwise: warm paper neutrals, a deep conifer green as the brand, terracotta as the accent.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#2c5e50", light: "#4f8575", dark: "#1d4136", contrastText: "#ffffff" },
        secondary: { main: "#a8482a", contrastText: "#ffffff" },
        error: { main: "#b3261e" },
        warning: { main: "#8a5a00", light: "#c98a1b" },
        success: { main: "#2e6b3f" },
        background: { default: "#f5f3ef", paper: "#ffffff" },
        text: { primary: "#1f2421", secondary: "#58605b" },
        divider: "#e2ded6",
        party,
        plan: {
          floor: "#fbfaf7",
          wall: "#8c8579",
          grid: "#ece8df",
          tableFill: "#ffffff",
          tableStroke: "#b9b2a5",
          stage: "#47403a",
          stageText: "#f5f1ea",
          dance: "#efe3cf",
          danceLine: "#dccaa8",
          bar: "#d9c7ae",
          door: "#6aa384",
          seatEmpty: "#a39c8f",
          text: "#2d2a26",
          muted: "#6c665c",
          diet: "#f2b233",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#86c7b2", light: "#a8dccb", dark: "#5aa38c", contrastText: "#0c1a15" },
        secondary: { main: "#e79a7a", contrastText: "#2a0f06" },
        error: { main: "#ff8a80" },
        warning: { main: "#f0b44c" },
        success: { main: "#7fd09a" },
        background: { default: "#121513", paper: "#1b1f1d" },
        text: { primary: "#ecefec", secondary: "#a4aca7" },
        divider: "#2e3431",
        party,
        plan: {
          floor: "#1a1d1b",
          wall: "#6e756f",
          grid: "#232724",
          tableFill: "#272c29",
          tableStroke: "#566059",
          stage: "#3a413d",
          stageText: "#e8ece8",
          dance: "#2d3330",
          danceLine: "#3c4540",
          bar: "#3b3a33",
          door: "#3f7a5b",
          seatEmpty: "#6f7872",
          text: "#e7ebe8",
          muted: "#a1aaa4",
          diet: "#f2b233",
        },
      },
    },
  },
  typography: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 650, letterSpacing: "-0.01em" },
    h6: { fontWeight: 650 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiTab: { styleOverrides: { root: { minHeight: 48 } } },
  },
});

export default theme;
