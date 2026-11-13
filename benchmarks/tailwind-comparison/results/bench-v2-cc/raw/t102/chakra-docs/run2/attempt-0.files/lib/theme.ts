import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const headingFont =
  'ui-rounded, "SF Pro Rounded", system-ui, sans-serif'
const bodyFont = "ui-sans-serif, system-ui, sans-serif"

const config = defineConfig({
  globalCss: {
    html: {
      // Lumen's brand colour is the default palette: primary buttons, focus
      // rings, switches, links and badges all follow it.
      colorPalette: "brand",
      fontFamily: "body",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
    },
    a: {
      color: "colorPalette.fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: headingFont },
        body: { value: bodyFont },
      },
      colors: {
        // Lumen pink, #DB2777 at 600.
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
        // Warm sand neutrals replace the cool grays.
        gray: {
          50: { value: "#faf7f2" },
          100: { value: "#f4efe6" },
          200: { value: "#e8e0d0" },
          300: { value: "#d6cab4" },
          400: { value: "#b5a68b" },
          500: { value: "#8f8068" },
          600: { value: "#6f6350" },
          700: { value: "#544a3c" },
          800: { value: "#3a3329" },
          900: { value: "#26211a" },
          950: { value: "#17130e" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
        },
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
        },
      },
      // 16px on buttons, inputs, cards and menus (they use l2 and l3).
      radii: {
        l1: { value: "{radii.xl}" },
        l2: { value: "{radii.2xl}" },
        l3: { value: "{radii.2xl}" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
