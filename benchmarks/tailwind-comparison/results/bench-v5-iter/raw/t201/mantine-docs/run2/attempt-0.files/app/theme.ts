import { createTheme } from "@mantine/core";

// System font stack, identical in every arm (no network font fetch at build).
export const theme = createTheme({
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "ui-sans-serif, system-ui, sans-serif", fontWeight: "700" },
  primaryColor: "teal",
  primaryShade: { light: 9, dark: 5 },
  colors: {
    // Slightly darker grey 6 so "dimmed" text keeps AA contrast.
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
  defaultRadius: "md",
  components: {
    Button: { defaultProps: { size: "md" } },
    Paper: { defaultProps: { withBorder: true } },
  },
});
