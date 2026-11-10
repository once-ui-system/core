import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's visual identity, carried by the design system itself: brand and sand
// colour tokens, 16px radii, rounded heading font, and a brand colour palette
// that every component (buttons, links, focus rings) picks up by default.
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif',
        },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#fdf2f8" },
          100: { value: "#fce7f3" },
          200: { value: "#fbcfe8" },
          300: { value: "#f9a8d4" },
          400: { value: "#f472b6" },
          500: { value: "#ec4899" },
          600: { value: "#db2777" },
          700: { value: "#be185d" },
          800: { value: "#9d174d" },
          900: { value: "#831843" },
          950: { value: "#500724" },
        },
        // Warm sand replaces the cool default neutrals.
        gray: {
          50: { value: "#fbf8f3" },
          100: { value: "#f5efe5" },
          200: { value: "#ebe2d2" },
          300: { value: "#dccfb8" },
          400: { value: "#b9aa8f" },
          500: { value: "#8f8069" },
          600: { value: "#6f6350" },
          700: { value: "#574d3e" },
          800: { value: "#3a3329" },
          900: { value: "#26211a" },
          950: { value: "#17130e" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          subtle: {
            value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          focusRing: { value: "{colors.brand.600}" },
          border: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
        },
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.950}" },
          },
        },
      },
      radii: {
        l1: { value: "12px" },
        l2: { value: "16px" },
        l3: { value: "16px" },
      },
    },
    recipes: {
      button: {
        defaultVariants: { size: "lg" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
