"use client";

import { createTheme } from "@mui/material/styles";

const headingFont = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const bodyFont = "ui-sans-serif, system-ui, sans-serif";
const radius = 16;

// Lumen: friendly, upbeat, generous. Brand pink #DB2777, warm sand neutrals,
// 16px corners and airy density, all carried by the theme.
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#DB2777",
          dark: "#BE185D",
          light: "#F472B6",
          contrastText: "#FFFFFF",
        },
        secondary: { main: "#B45309" },
        background: { default: "#FBF7F0", paper: "#FFFDF9" },
        text: { primary: "#3A2E24", secondary: "#6B5B4B" },
        divider: "#E9DFCE",
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#F472B6",
          dark: "#EC4899",
          light: "#F9A8D4",
          contrastText: "#2B0A19",
        },
        secondary: { main: "#F5B26B" },
        background: { default: "#17130F", paper: "#211B15" },
        text: { primary: "#F5EDE0", secondary: "#C9BBA8" },
        divider: "#3A3027",
      },
    },
  },
  shape: { borderRadius: radius },
  spacing: 8,
  typography: {
    fontFamily: bodyFont,
    h1: { fontFamily: headingFont, fontWeight: 700 },
    h2: { fontFamily: headingFont, fontWeight: 700 },
    h3: { fontFamily: headingFont, fontWeight: 700 },
    h4: { fontFamily: headingFont, fontWeight: 700 },
    h5: { fontFamily: headingFont, fontWeight: 700 },
    h6: { fontFamily: headingFont, fontWeight: 700 },
    button: { fontWeight: 700, fontSize: "1rem", textTransform: "none" },
    body1: { fontSize: "1.0625rem", lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ":focus-visible": {
          outline: `3px solid ${(theme.vars || theme).palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radius, minHeight: 48, paddingInline: 24 },
        sizeSmall: { minHeight: 40, paddingInline: 16 },
        sizeLarge: { minHeight: 56, paddingInline: 32 },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { padding: 12, borderRadius: radius } },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme }) => ({
          color: (theme.vars || theme).palette.primary.main,
          fontWeight: 600,
          ...theme.applyStyles("light", {
            color: (theme.vars || theme).palette.primary.dark,
          }),
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius,
          "& .MuiOutlinedInput-input": { paddingBlock: 16, paddingInline: 18 },
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: radius } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 28, "&:last-child": { paddingBottom: 28 } } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: radius } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: radius } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: radius } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 44 } } },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 52,
          borderRadius: radius,
          marginBlock: 2,
          "&.Mui-selected": {
            backgroundColor: (theme.vars || theme).palette.primary.main,
            color: (theme.vars || theme).palette.primary.contrastText,
            "& .MuiListItemIcon-root": { color: "inherit" },
            "&:hover": { backgroundColor: (theme.vars || theme).palette.primary.dark },
            ...theme.applyStyles("dark", {
              "&:hover": { backgroundColor: (theme.vars || theme).palette.primary.light },
            }),
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { paddingBlock: 20, paddingInline: 20 } },
    },
  },
});

export default theme;
