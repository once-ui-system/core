import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace';
const SANS = "ui-sans-serif, system-ui, sans-serif";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bg",
      color: "fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: MONO },
        body: { value: SANS },
        mono: { value: MONO },
      },
      colors: {
        // Lumen orange, built around #E8590C (500)
        brand: {
          "50": { value: "#fff4ec" },
          "100": { value: "#ffe6d3" },
          "200": { value: "#ffcca6" },
          "300": { value: "#ffa970" },
          "400": { value: "#f47a33" },
          "500": { value: "#e8590c" },
          "600": { value: "#c74a08" },
          "700": { value: "#a43b07" },
          "800": { value: "#7f2e09" },
          "900": { value: "#5c2308" },
          "950": { value: "#3a1505" },
        },
        // warm stone neutrals replace the default grey scale
        gray: {
          "50": { value: "#fafaf9" },
          "100": { value: "#f5f5f4" },
          "200": { value: "#e7e5e4" },
          "300": { value: "#d6d3d1" },
          "400": { value: "#a8a29e" },
          "500": { value: "#78716c" },
          "600": { value: "#57534e" },
          "700": { value: "#44403c" },
          "800": { value: "#292524" },
          "900": { value: "#1c1917" },
          "950": { value: "#0c0a09" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
      colors: {
        bg: {
          DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.gray.950}" } },
          subtle: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
          muted: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
          panel: { value: { base: "{colors.white}", _dark: "{colors.gray.900}" } },
        },
        brand: {
          contrast: { value: "{colors.gray.950}" },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { base: "{colors.brand.100}", _dark: "{colors.brand.950}" } },
          subtle: { value: { base: "{colors.brand.200}", _dark: "{colors.brand.900}" } },
          emphasized: { value: { base: "{colors.brand.300}", _dark: "{colors.brand.800}" } },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
