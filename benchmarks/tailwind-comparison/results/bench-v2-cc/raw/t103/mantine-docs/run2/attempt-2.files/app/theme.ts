import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Lumen brand orange #E8590C sits at index 6, the primary shade.
const brand: MantineColorsTuple = [
  "#fff3ea",
  "#ffe3d1",
  "#ffc7a1",
  "#ffa56b",
  "#f58340",
  "#ee6c24",
  "#E8590C",
  "#c94a08",
  "#a63d07",
  "#7f2f06",
];

// Warm stone neutrals. `dark` drives surfaces and borders in dark mode,
// `gray` drives them in light mode.
const dark: MantineColorsTuple = [
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#a39c96",
  "#4a4440",
  "#44403c",
  "#292524",
  "#1c1917",
  "#171413",
  "#0c0a09",
];

const gray: MantineColorsTuple = [
  "#fafaf9",
  "#f5f5f4",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
];

const mono = 'ui-monospace, "SFMono-Regular", Menlo, monospace';

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  colors: { brand, dark, gray },
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontFamilyMonospace: mono,
  headings: {
    fontFamily: mono,
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.25" },
      h2: { fontSize: "1.375rem", lineHeight: "1.3" },
      h3: { fontSize: "1.125rem", lineHeight: "1.35" },
      h4: { fontSize: "1rem", lineHeight: "1.4" },
    },
  },
  defaultRadius: "sm",
  radius: { xs: "4px", sm: "4px", md: "4px", lg: "4px", xl: "4px" },
  focusRing: "auto",
  components: {
    Card: { defaultProps: { withBorder: true, padding: "md" } },
  },
});
