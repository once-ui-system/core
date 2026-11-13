import { createTheme, type MantineColorsTuple } from "@mantine/core";

const fig: MantineColorsTuple = [
  "#f7f2fb",
  "#ece1f5",
  "#d9c2ec",
  "#c3a0e0",
  "#b184d6",
  "#a46fcf",
  "#9a5fc8",
  "#8449ae",
  "#6f3d93",
  "#5a317a",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  colors: { fig },
  primaryColor: "fig",
  primaryShade: 7,
  defaultRadius: "md",
  cursorType: "pointer",
});
