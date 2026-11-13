"use client";

import NextLink from "next/link";
import { createTheme } from "@mui/material/styles";
import type { LinkProps } from "@mui/material/Link";

// Lumen brand tokens. Everything below is carried by the theme so that every
// screen follows it without one-off styles on elements.
const BODY_FONT = 'ui-sans-serif, system-ui, sans-serif';
const HEADING_FONT = 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif';
const RADIUS = 16;

const heading = {
  fontFamily: HEADING_FONT,
  fontWeight: 700,
  letterSpacing: "-0.015em",
} as const;

const v = (token: string) => `var(--mui-palette-${token})`;

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#DB2777",
          light: "#F472B6",
          dark: "#BE185D",
          contrastText: "#FFFFFF",
        },
        secondary: { main: "#8A6A3F", contrastText: "#FFFFFF" },
        background: { default: "#FAF5EC", paper: "#FFFEFB" },
        text: { primary: "#3A2E22", secondary: "#6B5B49" },
        divider: "#E8DCC6",
        grey: {
          50: "#FBF7F0",
          100: "#F4EDE0",
          200: "#E8DCC6",
          300: "#D8C9AE",
          400: "#B9A687",
          500: "#968568",
          600: "#74664E",
          700: "#574B39",
          800: "#3A2E22",
          900: "#241C14",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#F472B6",
          light: "#F9A8D4",
          dark: "#EC4899",
          contrastText: "#2B0A1A",
        },
        secondary: { main: "#D9B98A", contrastText: "#241C14" },
        background: { default: "#1C1712", paper: "#262019" },
        text: { primary: "#F5EDE0", secondary: "#CDBDA4" },
        divider: "#3D3326",
      },
    },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    fontFamily: BODY_FONT,
    h1: {
      ...heading,
      fontSize: "clamp(1.875rem, 1.5rem + 1.6vw, 2.5rem)",
      lineHeight: 1.15,
    },
    h2: { ...heading, fontSize: "2rem", lineHeight: 1.2 },
    h3: { ...heading, fontSize: "2.25rem", lineHeight: 1.15 },
    h4: { ...heading, fontSize: "1.75rem", lineHeight: 1.2 },
    h5: { ...heading, fontSize: "1.375rem", lineHeight: 1.3 },
    h6: { ...heading, fontSize: "1.125rem", lineHeight: 1.35 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.6 },
    button: { fontFamily: BODY_FONT, fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "a:focus-visible, button:focus-visible, [role='button']:focus-visible, [tabindex='0']:focus-visible":
          {
            outline: `3px solid ${v("primary-main")}`,
            outlineOffset: "2px",
          },
        "@media (prefers-reduced-motion: reduce)": {
          "*, *::before, *::after": {
            animationDuration: "0.01ms !important",
            transitionDuration: "0.01ms !important",
            scrollBehavior: "auto !important",
          },
        },
      },
    },
    MuiButtonBase: {
      defaultProps: { LinkComponent: NextLink },
    },
    MuiLink: {
      defaultProps: { component: NextLink, underline: "always" } as LinkProps,
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 48,
          paddingInline: 24,
          fontWeight: 700,
          textTransform: "none",
        },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "large" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: RADIUS, backgroundColor: v("background-paper") } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: { borderRadius: RADIUS, backgroundImage: "none" },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 24, "&:last-child": { paddingBottom: 24 } },
      },
    },
    MuiMenu: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: RADIUS } } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 48 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: RADIUS } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 12,
          fontSize: "0.875rem",
          padding: "8px 12px",
        },
      },
    },
    MuiAppBar: {
      defaultProps: { color: "inherit", elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: v("background-default"),
          color: v("text-primary"),
          backgroundImage: "none",
          borderBottom: `1px solid ${v("divider")}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 52,
          paddingInline: 16,
          "&.Mui-selected": {
            backgroundColor: v("primary-main"),
            color: v("primary-contrastText"),
            "&:hover, &.Mui-focusVisible": {
              backgroundColor: v("primary-dark"),
            },
            "& .MuiListItemIcon-root": { color: "inherit" },
          },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 44 } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS,
          minHeight: 48,
          paddingInline: 20,
          fontWeight: 700,
          textTransform: "none",
          "&.Mui-selected": {
            backgroundColor: v("primary-main"),
            color: v("primary-contrastText"),
            "&:hover": { backgroundColor: v("primary-dark") },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 10, borderRadius: 8 } },
    },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

export default theme;
