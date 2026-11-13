"use client";

import { createTheme } from "@mui/material/styles";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";
const BRAND = "#E8590C";

const heading = { fontFamily: MONO, fontWeight: 600, letterSpacing: "-0.01em" };

// Lumen: technical, focused. Brand orange on warm stone neutrals, 4px corners, dark by default.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: { main: BRAND, light: "#F2793A", dark: "#C2410C", contrastText: "#1c1917" },
        secondary: { main: "#a8a29e" },
        background: { default: "#1c1917", paper: "#292524" },
        text: { primary: "#fafaf9", secondary: "#a8a29e" },
        divider: "#44403c",
      },
    },
    light: {
      palette: {
        primary: { main: BRAND, light: "#F2793A", dark: "#C2410C", contrastText: "#1c1917" },
        secondary: { main: "#57534e" },
        background: { default: "#fafaf9", paper: "#ffffff" },
        text: { primary: "#1c1917", secondary: "#57534e" },
        divider: "#e7e5e4",
      },
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SANS,
    h1: { ...heading, fontSize: "2rem" },
    h2: { ...heading, fontSize: "1.625rem" },
    h3: { ...heading, fontSize: "1.375rem" },
    h4: { ...heading, fontSize: "1.25rem" },
    h5: { ...heading, fontSize: "1.0625rem" },
    h6: { ...heading, fontSize: "0.9375rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "a:focus-visible, button:focus-visible, [tabindex]:focus-visible": {
          outline: "2px solid var(--mui-palette-primary-main)",
          outlineOffset: 2,
        },
      },
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
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 4 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: (theme.vars || theme).palette.primary.main,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focused": { color: (theme.vars || theme).palette.primary.main },
        }),
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 4, backgroundImage: "none" } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" }, rounded: { borderRadius: 4 } },
    },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 4 } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: 4 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme }) => ({
          color: (theme.vars || theme).palette.primary.main,
          ...theme.applyStyles("light", { color: (theme.vars || theme).palette.primary.dark }),
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: { switchBase: { "&.Mui-focusVisible": { outline: "none" } } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          "&.Mui-selected": {
            color: (theme.vars || theme).palette.primary.main,
            backgroundColor: "rgba(232, 89, 12, 0.16)",
            boxShadow: `inset 3px 0 0 ${(theme.vars || theme).palette.primary.main}`,
            ...theme.applyStyles("light", { color: (theme.vars || theme).palette.primary.dark }),
            "&:hover": { backgroundColor: "rgba(232, 89, 12, 0.24)" },
          },
          "&.Mui-selected .MuiListItemIcon-root": { color: "inherit" },
        }),
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 40 } } },
    MuiDrawer: { styleOverrides: { paper: { backgroundImage: "none" } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "default" } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 4 } } },
  },
});

export default theme;
