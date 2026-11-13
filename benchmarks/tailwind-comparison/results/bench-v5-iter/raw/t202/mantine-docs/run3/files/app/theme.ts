import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Orangery green: a calm, dark sage that reads well next to the warm floor colours.
const brand: MantineColorsTuple = [
  "#eef7f1",
  "#dcede3",
  "#b8dac6",
  "#91c6a7",
  "#70b58f",
  "#5aaa7f",
  "#4aa575",
  "#3a8f62",
  "#2f7e56",
  "#1f6b46",
];

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "650" },
  colors: { brand },
  primaryColor: "brand",
  primaryShade: 8,
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Card: { defaultProps: { withBorder: true, radius: "lg", padding: "md" } },
    Paper: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "sm" } },
  },
});
