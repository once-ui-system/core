import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #0F766E sits at index 6, which is the primary shade.
const brand: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0f766e",
  "#0d6560",
  "#115e59",
  "#134e4a",
];

// Cool slate neutrals replace Mantine's gray scale.
const slate: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, gray: slate },
  black: "#0f172a",
  white: "#ffffff",
  autoContrast: true,
  focusRing: "auto",

  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.375rem", lineHeight: "1.25" },
      h2: { fontSize: "1.0625rem", lineHeight: "1.3" },
      h3: { fontSize: "0.9375rem", lineHeight: "1.35" },
      h4: { fontSize: "0.875rem", lineHeight: "1.4" },
      h5: { fontSize: "0.8125rem", lineHeight: "1.4" },
      h6: { fontSize: "0.75rem", lineHeight: "1.4" },
    },
  },

  // Compact density: smaller type and tighter spacing everywhere.
  fontSizes: {
    xs: "0.6875rem",
    sm: "0.75rem",
    md: "0.8125rem",
    lg: "0.9375rem",
    xl: "1.0625rem",
  },
  lineHeights: { xs: "1.3", sm: "1.35", md: "1.4", lg: "1.45", xl: "1.5" },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  // 2px corners on buttons, inputs, cards and menus.
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  defaultRadius: "sm",

  components: {
    Button: { defaultProps: { size: "xs" } },
    TextInput: { defaultProps: { size: "xs" } },
    Select: { defaultProps: { size: "xs" } },
    Switch: { defaultProps: { size: "sm" } },
    Card: { defaultProps: { padding: "md", withBorder: true } },
    Paper: { defaultProps: { withBorder: true } },
    Table: {
      defaultProps: {
        verticalSpacing: "xs",
        horizontalSpacing: "sm",
        highlightOnHover: true,
      },
    },
    Menu: { defaultProps: { shadow: "sm" } },
    NavLink: { defaultProps: { variant: "filled" } },
  },
});
