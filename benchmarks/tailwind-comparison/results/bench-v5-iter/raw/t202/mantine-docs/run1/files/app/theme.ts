import { DEFAULT_THEME, colorsTuple, createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  // Deep orangery green: the brand and primary colour (Mantine's teal, dark shade for contrast).
  colors: { brand: DEFAULT_THEME.colors.teal, ember: colorsTuple("#b8420a") },
  primaryColor: "brand",
  primaryShade: { light: 9, dark: 9 },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Paper: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm", c: "dark.9" } },
    Tooltip: { defaultProps: { openDelay: 150, withArrow: true } },
  },
});
