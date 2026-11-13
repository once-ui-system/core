import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's identity lives in the design system: brand and stone-grey tokens,
// semantic tokens for the brand palette, font tokens, 4px radii, and a global
// default colour palette so primary buttons, links, focus rings and the
// current nav item follow the brand everywhere (portals included).
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fff4ec" },
          100: { value: "#ffe5d1" },
          200: { value: "#ffc9a1" },
          300: { value: "#ffa766" },
          400: { value: "#f77d30" },
          500: { value: "#e8590c" },
          600: { value: "#c94a08" },
          700: { value: "#a03c0a" },
          800: { value: "#7a2f0c" },
          900: { value: "#4f1f0a" },
          950: { value: "#2b1005" },
        },
        // Warm stone grey replaces the default neutral scale.
        gray: {
          50: { value: "#fafaf9" },
          100: { value: "#f5f5f4" },
          200: { value: "#e7e5e4" },
          300: { value: "#d6d3d1" },
          400: { value: "#a8a29e" },
          500: { value: "#78716c" },
          600: { value: "#57534e" },
          700: { value: "#44403c" },
          800: { value: "#292524" },
          900: { value: "#1c1917" },
          950: { value: "#0c0a09" },
        },
      },
      fonts: {
        heading: {
          value: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
        },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
        mono: {
          value: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          // Dark text on the orange fill keeps button labels above 4.5:1.
          contrast: { value: "{colors.gray.950}" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.950}" },
          },
          subtle: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.900}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.800}" },
          },
          border: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
      // 4px corners on buttons, inputs, cards and menus.
      radii: {
        l1: { value: "{radii.sm}" },
        l2: { value: "{radii.sm}" },
        l3: { value: "{radii.sm}" },
      },
    },
    recipes: {
      link: {
        base: {
          color: "colorPalette.fg",
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
