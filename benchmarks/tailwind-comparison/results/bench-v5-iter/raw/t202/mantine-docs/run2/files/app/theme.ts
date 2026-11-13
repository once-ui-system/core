import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Seatwise brand: a deep, calm indigo that reads well next to the party colours.
const brand: MantineColorsTuple = [
  "#f1f1fb",
  "#e2e1f4",
  "#c4c2e8",
  "#a4a0dc",
  "#8982d1",
  "#776fca",
  "#6c63c7",
  "#5b53b0",
  "#504a9e",
  "#443f8c",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: { light: 7, dark: 5 },
  colors: { brand },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontWeight: "650",
  },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { fw: 600 } },
    Badge: { defaultProps: { fw: 600 } },
    Paper: { defaultProps: { radius: "md" } },
  },
});
