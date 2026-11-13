import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: {
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    fontWeight: "650",
  },
  colors: {
    // Darker mid greys so dimmed text and placeholders keep AA contrast.
    gray: [
      "#f8f9fa",
      "#f1f3f5",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#868e96",
      "#566069",
      "#495057",
      "#343a40",
      "#212529",
    ],
  },
  primaryColor: "teal",
  primaryShade: { light: 7, dark: 5 },
  defaultRadius: "md",
  cursorType: "pointer",
  components: {
    Button: { defaultProps: { fw: 600 } },
    Badge: { defaultProps: { fw: 650 } },
    Paper: { defaultProps: { radius: "md" } },
  },
});
