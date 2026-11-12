"use client";

import { createTheme } from "@mui/material/styles";

const serif = 'Georgia, "Times New Roman", serif';
const sans = "ui-sans-serif, system-ui, sans-serif";

// Cool slate neutrals.
const slate = {
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
};

const brand = "#0F766E";

const headingBase = { fontFamily: serif, fontWeight: 600, letterSpacing: 0 };

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand, contrastText: "#FFFFFF" },
        grey: slate,
        background: { default: slate[50], paper: "#FFFFFF" },
        text: { primary: slate[900], secondary: slate[600] },
        divider: slate[200],
      },
    },
    dark: {
      palette: {
        primary: { main: "#2DD4BF", contrastText: "#042F2E" },
        grey: slate,
        background: { default: slate[900], paper: slate[800] },
        text: { primary: slate[100], secondary: slate[400] },
        divider: slate[700],
      },
    },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: sans,
    fontSize: 13,
    h1: { ...headingBase, fontSize: "1.5rem", lineHeight: 1.25 },
    h2: { ...headingBase, fontSize: "1.25rem", lineHeight: 1.3 },
    h3: { ...headingBase, fontSize: "1.125rem", lineHeight: 1.3 },
    h4: { ...headingBase, fontSize: "1rem", lineHeight: 1.35 },
    h5: { ...headingBase, fontSize: "0.9375rem", lineHeight: 1.35 },
    h6: { ...headingBase, fontSize: "0.875rem", lineHeight: 1.35 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: { defaultProps: { size: "small", disableElevation: true } },
    MuiIconButton: { defaultProps: { size: "small" } },
    MuiTextField: { defaultProps: { size: "small", variant: "outlined" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiSwitch: { defaultProps: { size: "small" } },
    MuiToggleButton: { defaultProps: { size: "small" } },
    MuiToolbar: { defaultProps: { variant: "dense" } },
    MuiCard: { defaultProps: { variant: "outlined" } },
    MuiCardContent: {
      styleOverrides: { root: { padding: 12, "&:last-child": { paddingBottom: 12 } } },
    },
    MuiLink: { defaultProps: { underline: "hover" } },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: { root: { borderRadius: 2 } },
    },
    MuiTable: { defaultProps: { size: "small" } },
    MuiTableCell: {
      styleOverrides: {
        root: { padding: "6px 12px" },
        head: { fontWeight: 600 },
      },
    },
    MuiListItemButton: {
      defaultProps: { dense: true },
      styleOverrides: {
        root: ({ theme }) => {
          const channel = theme.vars?.palette.primary.mainChannel ?? "15 118 110";
          return {
            borderRadius: 2,
            paddingTop: 4,
            paddingBottom: 4,
            "&.Mui-selected": {
              backgroundColor: `rgba(${channel} / 0.12)`,
              color: (theme.vars || theme).palette.primary.main,
              "& .MuiListItemIcon-root": { color: "inherit" },
              "& .MuiListItemText-primary": { fontWeight: 600 },
            },
            "&.Mui-selected:hover": { backgroundColor: `rgba(${channel} / 0.18)` },
          };
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 32 } } },
  },
});

export default theme;
