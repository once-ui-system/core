"use client";

import { createTheme } from "@mui/material/styles";

const bodyFont = "ui-sans-serif, system-ui, sans-serif";
const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const RADIUS = 16;

const heading = (fontWeight: number) => ({ fontFamily: headingFont, fontWeight, letterSpacing: "-0.01em" });

// Lumen: friendly, upbeat, airy. Brand pink #DB2777, warm sand neutrals, 16px corners.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#DB2777", dark: "#BE185D", light: "#F472B6", contrastText: "#FFFFFF" },
        secondary: { main: "#7A5E3E", contrastText: "#FFFFFF" },
        background: { default: "#F8F2E9", paper: "#FFFCF7" },
        text: { primary: "#33281E", secondary: "#6B5A47" },
        divider: "#E6D9C6",
      },
    },
    dark: {
      palette: {
        primary: { main: "#F472B6", dark: "#DB2777", light: "#F9A8D4", contrastText: "#2A0A18" },
        secondary: { main: "#D9BE98", contrastText: "#241E17" },
        background: { default: "#19140F", paper: "#241E17" },
        text: { primary: "#F6EDE0", secondary: "#C9B9A2" },
        divider: "#3D3326",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: bodyFont,
    h1: { ...heading(800), fontSize: "2.5rem", lineHeight: 1.15 },
    h2: { ...heading(800), fontSize: "2rem", lineHeight: 1.2 },
    h3: { ...heading(700), fontSize: "1.65rem", lineHeight: 1.25 },
    h4: { ...heading(700), fontSize: "1.4rem", lineHeight: 1.3 },
    h5: { ...heading(700), fontSize: "1.2rem", lineHeight: 1.35 },
    h6: { ...heading(700), fontSize: "1.05rem", lineHeight: 1.4 },
    button: { fontFamily: bodyFont, fontWeight: 700, textTransform: "none", letterSpacing: 0 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":focus-visible": {
          outline: "3px solid var(--mui-palette-primary-main)",
          outlineOffset: "2px",
        },
      },
    },
    MuiLink: {
      defaultProps: { color: "primary", underline: "hover" },
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS, minHeight: 48, padding: "10px 26px", fontSize: "1rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIUS, padding: 12 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: RADIUS, backgroundColor: "var(--mui-palette-background-paper)" },
        input: { padding: "16px 18px" },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: RADIUS, border: "1px solid var(--mui-palette-divider)", boxShadow: "none" },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 28, "&:last-child": { paddingBottom: 28 } } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48, borderRadius: 12 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 56,
          paddingLeft: 16,
          paddingRight: 16,
          "&.Mui-selected": {
            backgroundColor: "var(--mui-palette-primary-main)",
            color: "var(--mui-palette-primary-contrastText)",
            "&:hover": { backgroundColor: "var(--mui-palette-primary-dark)" },
            "& .MuiListItemIcon-root": { color: "inherit" },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 48 } } },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 12, fontWeight: 600, height: 32 } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: 12, fontSize: "0.85rem", padding: "8px 14px" } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "20px 24px" },
        head: { fontWeight: 700, color: "var(--mui-palette-text-secondary)" },
      },
    },
    MuiDrawer: { styleOverrides: { paper: { borderRadius: 0 } } },
  },
});

export default theme;
