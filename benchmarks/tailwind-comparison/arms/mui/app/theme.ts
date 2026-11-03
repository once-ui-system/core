"use client";

import { createTheme } from "@mui/material/styles";

// Official Next.js App Router setup: CSS variables with light and dark schemes.
// System font stack, identical in every arm (no network font fetch at build).
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: { light: true, dark: true },
  typography: { fontFamily: "ui-sans-serif, system-ui, sans-serif" },
});

export default theme;
