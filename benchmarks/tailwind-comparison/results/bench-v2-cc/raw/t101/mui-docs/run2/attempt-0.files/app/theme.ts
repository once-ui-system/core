"use client";

import { createTheme, type Theme } from "@mui/material/styles";

// Lumen: calm, exact, ledger-like. All of the brand lives here, so every screen follows it.
const headingFont = 'Georgia, "Times New Roman", serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";

// Cool slate neutrals.
const slate = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
};

const BRAND = "#0F766E";
const RADIUS = 2;

const palette = (theme: Theme) => (theme.vars || theme).palette;
const focusRing = (theme: Theme) => ({
  outline: `2px solid ${palette(theme).primary.main}`,
  outlineOffset: 2,
});

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: BRAND, contrastText: "#ffffff" },
        secondary: { main: slate[700] },
        success: { main: "#15803d" },
        warning: { main: "#b45309" },
        error: { main: "#b91c1c" },
        info: { main: "#0369a1" },
        grey: slate,
        background: { default: slate[50], paper: "#ffffff" },
        text: { primary: slate[900], secondary: slate[600] },
        divider: slate[200],
      },
    },
    dark: {
      palette: {
        primary: { main: "#2dd4bf", contrastText: "#042f2e" },
        secondary: { main: slate[300] },
        success: { main: "#4ade80" },
        warning: { main: "#fbbf24" },
        error: { main: "#f87171" },
        info: { main: "#38bdf8" },
        grey: slate,
        background: { default: "#0b1220", paper: "#111a2b" },
        text: { primary: slate[100], secondary: slate[400] },
        divider: slate[800],
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: bodyFont,
    body1: { fontSize: "0.875rem", lineHeight: 1.5 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.45 },
    caption: { fontSize: "0.75rem" },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.8125rem" },
    h1: { fontFamily: headingFont, fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" },
    h2: { fontFamily: headingFont, fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
    h3: { fontFamily: headingFont, fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.3 },
    h4: { fontFamily: headingFont, fontSize: "1rem", fontWeight: 600, lineHeight: 1.35 },
    h5: { fontFamily: headingFont, fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.35 },
    h6: { fontFamily: headingFont, fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.35 },
    overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        ":focus-visible": focusRing(t),
      }),
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": focusRing(t),
        }),
      },
    },
    MuiButton: { defaultProps: { size: "small", disableElevation: true } },
    MuiIconButton: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small", margin: "dense" } },
    MuiFormControl: { defaultProps: { size: "small", margin: "dense" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiLink: { defaultProps: { underline: "always" } },
    MuiAppBar: {
      defaultProps: { color: "inherit", elevation: 0 },
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: palette(t).background.paper,
          backgroundImage: "none",
          color: palette(t).text.primary,
          borderBottom: `1px solid ${palette(t).divider}`,
        }),
      },
    },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: "12px 16px", "&:last-child": { paddingBottom: 12 } },
      },
    },
    MuiList: { defaultProps: { dense: true } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32 } } },
    MuiListItemButton: {
      defaultProps: { dense: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          color: palette(t).text.primary,
          "& .MuiListItemIcon-root": { color: palette(t).text.secondary },
          "&.Mui-selected": {
            backgroundColor: `color-mix(in srgb, ${palette(t).primary.main} 12%, transparent)`,
            color: palette(t).primary.main,
            fontWeight: 600,
            "& .MuiListItemIcon-root": { color: palette(t).primary.main },
            "&:hover": {
              backgroundColor: `color-mix(in srgb, ${palette(t).primary.main} 18%, transparent)`,
            },
          },
        }),
      },
    },
    MuiMenuItem: { defaultProps: { dense: true } },
    MuiTooltip: {
      styleOverrides: { tooltip: { borderRadius: RADIUS, fontSize: "0.75rem" } },
    },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "6px 12px", fontVariantNumeric: "tabular-nums" },
        head: ({ theme: t }) => ({
          fontWeight: 600,
          color: palette(t).text.secondary,
          backgroundColor: palette(t).background.default,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: RADIUS, height: 6 } },
    },
  },
});

export default theme;
