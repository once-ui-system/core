import {
  Badge,
  Button,
  Card,
  Drawer,
  Menu,
  NumberInput,
  Paper,
  Select,
  SegmentedControl,
  Switch,
  Table,
  TextInput,
  Tooltip,
  createTheme,
  type MantineColorsTuple,
} from "@mantine/core";

// Lumen brand teal: shade 7 is exactly #0F766E.
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

// Cool slate neutrals replace the default grey and dark scales.
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

export const theme = createTheme({
  primaryColor: "lumen",
  primaryShade: { light: 7, dark: 5 },
  colors: { lumen, gray: slate, dark: slateDark },
  black: "#0f172a",
  autoContrast: true,
  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  headings: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.5rem", lineHeight: "1.25" },
      h2: { fontSize: "1.25rem", lineHeight: "1.3" },
      h3: { fontSize: "1.0625rem", lineHeight: "1.35" },
      h4: { fontSize: "0.9375rem", lineHeight: "1.4" },
      h5: { fontSize: "0.8125rem", lineHeight: "1.4" },
      h6: { fontSize: "0.75rem", lineHeight: "1.4" },
    },
  },
  fontSizes: {
    xs: "0.6875rem",
    sm: "0.8125rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.125rem",
  },
  radius: { xs: "2px", sm: "2px", md: "2px", lg: "2px", xl: "2px" },
  defaultRadius: "xs",
  spacing: {
    xs: "0.375rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  components: {
    Button: Button.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    TextInput: TextInput.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    Select: Select.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    SegmentedControl: SegmentedControl.extend({ defaultProps: { size: "xs", radius: "xs" } }),
    Switch: Switch.extend({ defaultProps: { size: "xs" } }),
    Card: Card.extend({ defaultProps: { padding: "md", radius: "xs", withBorder: true } }),
    Paper: Paper.extend({ defaultProps: { radius: "xs" } }),
    Menu: Menu.extend({ defaultProps: { radius: "xs", shadow: "sm" } }),
    Drawer: Drawer.extend({ defaultProps: { radius: 0 } }),
    Badge: Badge.extend({ defaultProps: { radius: "xs", size: "sm" } }),
    Tooltip: Tooltip.extend({ defaultProps: { radius: "xs" } }),
    Table: Table.extend({
      defaultProps: { verticalSpacing: 6, horizontalSpacing: "sm", fz: "sm" },
    }),
  },
});
