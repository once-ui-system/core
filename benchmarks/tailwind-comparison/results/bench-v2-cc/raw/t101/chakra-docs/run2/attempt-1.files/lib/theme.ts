import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's identity lives here: tokens, semantic tokens, fonts, radii and global styles.
const config = defineConfig({
  globalCss: {
    // Brand teal becomes the default colour palette: primary buttons, switches,
    // links (colorPalette.fg) and focus rings all follow it.
    html: { colorPalette: "brand" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#f0fdfa" },
          100: { value: "#ccfbf1" },
          200: { value: "#99f6e4" },
          300: { value: "#5eead4" },
          400: { value: "#2dd4bf" },
          500: { value: "#14b8a6" },
          600: { value: "#0d9488" },
          700: { value: "#0f766e" },
          800: { value: "#115e59" },
          900: { value: "#134e4a" },
          950: { value: "#042f2e" },
        },
        // Cool slate neutrals replace Chakra's gray scale.
        gray: {
          50: { value: "#f8fafc" },
          100: { value: "#f1f5f9" },
          200: { value: "#e2e8f0" },
          300: { value: "#cbd5e1" },
          400: { value: "#94a3b8" },
          500: { value: "#64748b" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1e293b" },
          900: { value: "#0f172a" },
          950: { value: "#020617" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
      },
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.500}" } },
          contrast: { value: { _light: "white", _dark: "{colors.brand.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
