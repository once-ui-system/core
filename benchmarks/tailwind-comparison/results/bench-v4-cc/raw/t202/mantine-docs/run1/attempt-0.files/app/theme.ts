import { createTheme, type MantineColorsTuple } from "@mantine/core";

const moss: MantineColorsTuple = [
  "#eef7f3",
  "#d9ece4",
  "#b3d9c9",
  "#8ac4ac",
  "#66b293",
  "#4ea583",
  "#3f9f7a",
  "#308a68",
  "#257a5a",
  "#136849",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "650" },
  colors: { moss },
  primaryColor: "moss",
  primaryShade: { light: 7, dark: 6 },
  defaultRadius: "md",
});
