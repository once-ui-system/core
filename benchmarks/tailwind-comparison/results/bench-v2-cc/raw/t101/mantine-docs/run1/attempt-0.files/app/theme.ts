import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand: #0F766E sits at index 7 of the "lumen" scale.
const lumen: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#5eead4",
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",
  "#134e4a",
];

// Cool slate neutrals.
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

const slateDark: MantineColorsTuple = [
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#172033",
  "#0f172a",
  "#0b1220",
];

const serif = 'Georgia, "Times New Roman", serif';

export const theme = createTheme({
  colors: { lumen, gray: slate, dark: slateDark },
  primaryColor: "lumen",
  primaryShade: { light: 7, dark: 5 },
  black: "#0f172a",
  defaultRadius: "xs",
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSizes: { xs: "11px", sm: "12.5px", md: "13.5px", lg: "15px", xl: "17px" },
  spacing: { xs: "6px", sm: "8px", md: "12px", lg: "16px", xl: "24px" },
  lineHeights: { xs: "1.3", sm: "1.35", md: "1.4", lg: "1.45", xl: "1.5" },
  headings: {
    fontFamily: serif,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "26px", lineHeight: "1.25" },
      h2: { fontSize: "21px", lineHeight: "1.25" },
      h3: { fontSize: "17px", lineHeight: "1.3" },
      h4: { fontSize: "15px", lineHeight: "1.3" },
      h5: { fontSize: "13.5px", lineHeight: "1.35" },
      h6: { fontSize: "12.5px", lineHeight: "1.35" },
    },
  },
  components: {
    Button: { defaultProps: { size: "xs", radius: "xs" } },
    ActionIcon: { defaultProps: { size: "md", radius: "xs" } },
    TextInput: { defaultProps: { size: "xs", radius: "xs" } },
    Select: { defaultProps: { size: "xs", radius: "xs" } },
    Switch: { defaultProps: { size: "sm" } },
    SegmentedControl: { defaultProps: { size: "xs", radius: "xs" } },
    Card: { defaultProps: { padding: "md", radius: "xs", withBorder: true } },
    Paper: { defaultProps: { radius: "xs" } },
    Badge: { defaultProps: { size: "sm", radius: "xs" } },
    Menu: { defaultProps: { radius: "xs" } },
    Tooltip: { defaultProps: { radius: "xs" } },
    Table: { defaultProps: { verticalSpacing: "xs", horizontalSpacing: "sm", fz: "sm" } },
    NavLink: { defaultProps: { radius: "xs" } },
  },
});
