"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Lumen brand tokens.
 * Everything visual about the brand lives here so that components stay
 * free of one-off colours, radii and fonts.
 */
const BRAND = "#E8590C";
// Darker brand shade used for text/links on light surfaces (>= 4.5:1 on stone-50).
const BRAND_ON_LIGHT = "#B8440A";
// Lighter brand shade used for text/links on dark surfaces (>= 4.5:1 on stone-900).
const BRAND_LIGHT = "#F4813F";

const HEADING_FONT = 'Georgia, "Times New Roman", serif';
const BODY_FONT = "ui-sans-serif, system-ui, sans-serif";

const RADIUS = 4;

// Warm stone-grey scale.
const stone = {
  50: "#FAFAF9",
  100: "#F5F5F4",
  200: "#E7E5E4",
  300: "#D6D3D1",
  400: "#A8A29E",
  500: "#78716C",
  600: "#57534E",
  700: "#44403C",
  800: "#292524",
  900: "#1C1917",
  950: "#0C0A09",
};

const headingStyle = {
  fontFamily: HEADING_FONT,
  fontWeight: 700,
  letterSpacing: "-0.01em",
} as const;

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: "#C2410C",
          // Near-black text on the brand orange is 5.6:1; white would be 3.6:1.
          contrastText: stone[950],
        },
        secondary: {
          main: stone[300],
          contrastText: stone[900],
        },
        grey: stone,
        background: { default: stone[900], paper: stone[800] },
        text: {
          primary: stone[50],
          secondary: stone[300],
          disabled: stone[500],
        },
        divider: "rgba(214, 211, 209, 0.16)",
        action: {
          active: stone[300],
          hover: "rgba(214, 211, 209, 0.08)",
          selected: "rgba(232, 89, 12, 0.16)",
          disabled: stone[500],
          disabledBackground: "rgba(214, 211, 209, 0.12)",
        },
      },
    },
    light: {
      palette: {
        primary: {
          main: BRAND,
          light: BRAND_LIGHT,
          dark: BRAND_ON_LIGHT,
          contrastText: stone[950],
        },
        secondary: {
          main: stone[700],
          contrastText: stone[50],
        },
        grey: stone,
        background: { default: stone[50], paper: "#FFFFFF" },
        text: {
          primary: stone[900],
          secondary: stone[600],
          disabled: stone[400],
        },
        divider: stone[200],
        action: {
          active: stone[600],
          hover: "rgba(87, 83, 78, 0.06)",
          selected: "rgba(232, 89, 12, 0.12)",
          disabled: stone[400],
          disabledBackground: stone[200],
        },
      },
    },
  },
  shape: { borderRadius: RADIUS },
  // Brand-coloured two-pixel keyboard focus ring on every ButtonBase-derived control.
  focusVisible: { outlineColor: BRAND, outlineOffset: 2 },
  typography: {
    fontFamily: BODY_FONT,
    h1: { ...headingStyle, fontSize: "clamp(2.25rem, 1.4rem + 3.6vw, 4rem)", lineHeight: 1.1 },
    h2: { ...headingStyle, fontSize: "clamp(1.75rem, 1.3rem + 2vw, 2.75rem)", lineHeight: 1.15 },
    h3: { ...headingStyle, fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 2rem)", lineHeight: 1.2 },
    h4: { ...headingStyle, fontSize: "1.5rem", lineHeight: 1.25 },
    h5: { ...headingStyle, fontSize: "1.25rem", lineHeight: 1.3 },
    h6: { ...headingStyle, fontSize: "1.0625rem", lineHeight: 1.35 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: "0.12em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { transition: "background-color 150ms ease, color 150ms ease" },
        "::selection": { backgroundColor: "rgba(232, 89, 12, 0.35)" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS },
        sizeLarge: { padding: "11px 24px", fontSize: "1rem" },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiToggleButton: {
      styleOverrides: { root: { borderRadius: RADIUS, textTransform: "none" } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiFilledInput: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiInputBase: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: RADIUS },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: RADIUS, border: "1px solid var(--mui-palette-divider)" },
      },
    },
    MuiPopover: {
      styleOverrides: { paper: { borderRadius: RADIUS } },
    },
    MuiMenuItem: {
      styleOverrides: { root: { borderRadius: RADIUS, margin: "0 4px" } },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "default" },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "var(--mui-palette-background-default)",
          color: "var(--mui-palette-text-primary)",
          borderBottom: "1px solid var(--mui-palette-divider)",
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          border: "1px solid var(--mui-palette-divider)",
          borderRadius: RADIUS,
          "&:not(:last-of-type)": { marginBottom: 8 },
          "&::before": { display: "none" },
          "&.Mui-expanded": { margin: 0, marginBottom: 8 },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: { root: { borderRadius: RADIUS, fontWeight: 600 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: RADIUS } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontFamily: BODY_FONT },
      },
    },
    MuiLink: {
      defaultProps: { underline: "hover" },
      styleOverrides: {
        root: ({ theme: t }) => ({
          // Brand link colour; the darker shade keeps 4.5:1 on light surfaces.
          color: t.vars.palette.primary.main,
          fontWeight: 500,
          borderRadius: 2,
          ...t.applyStyles("light", { color: BRAND_ON_LIGHT }),
        }),
      },
    },
  },
});

export default theme;
