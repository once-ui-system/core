"use client";

import { createTheme } from "@mui/material/styles";

const HEADING_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = "ui-sans-serif, system-ui, sans-serif";
const RADIUS = 2;

const heading = { fontFamily: HEADING_FONT, fontWeight: 600, letterSpacing: "-0.005em" };

// Lumen: calm, exact, trustworthy. Teal brand, cool slate neutrals, 2px corners, compact density.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0F766E", dark: "#115E59", light: "#14B8A6", contrastText: "#FFFFFF" },
        secondary: { main: "#475569" },
        background: { default: "#F8FAFC", paper: "#FFFFFF" },
        text: { primary: "#0F172A", secondary: "#475569" },
        divider: "#E2E8F0",
        grey: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
    },
    dark: {
      palette: {
        primary: { main: "#2DD4BF", dark: "#14B8A6", light: "#5EEAD4", contrastText: "#042F2E" },
        secondary: { main: "#94A3B8" },
        background: { default: "#0B1220", paper: "#111A2B" },
        text: { primary: "#F1F5F9", secondary: "#A5B4C8" },
        divider: "#26334A",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  spacing: 8,
  typography: {
    fontFamily: BODY_FONT,
    fontSize: 13,
    h1: { ...heading, fontSize: "1.75rem" },
    h2: { ...heading, fontSize: "1.5rem" },
    h3: { ...heading, fontSize: "1.3rem" },
    h4: { ...heading, fontSize: "1.2rem" },
    h5: { ...heading, fontSize: "1.1rem" },
    h6: { ...heading, fontSize: "1rem" },
    subtitle1: { fontSize: "0.9rem" },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600 },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.8125rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (t) => ({
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${(t.vars || t).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme: t }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(t.vars || t).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { size: "small", disableElevation: true },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiIconButton: { defaultProps: { size: "small" }, styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiInputBase: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: (t.vars || t).palette.primary.main,
          },
        }),
      },
    },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiCheckbox: { defaultProps: { size: "small" } },
    MuiChip: { defaultProps: { size: "small" }, styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiLink: { defaultProps: { underline: "hover", color: "primary" } },
    MuiPaper: { styleOverrides: { root: { borderRadius: RADIUS, backgroundImage: "none" } } },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 12, "&:last-child": { paddingBottom: 12 } } },
    },
    MuiCardHeader: { styleOverrides: { root: { padding: "10px 12px" } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { defaultProps: { dense: true } },
    MuiList: { defaultProps: { dense: true } },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "4px 12px" },
        head: { fontWeight: 600, whiteSpace: "nowrap" },
      },
    },
    MuiToolbar: { defaultProps: { variant: "dense" } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: RADIUS } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32, color: "inherit" } } },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: RADIUS,
          paddingTop: 3,
          paddingBottom: 3,
          "&.Mui-selected": {
            backgroundColor: (t.vars || t).palette.primary.main,
            color: (t.vars || t).palette.primary.contrastText,
            "&:hover": { backgroundColor: (t.vars || t).palette.primary.dark },
          },
        }),
      },
    },
  },
});

export default theme;
