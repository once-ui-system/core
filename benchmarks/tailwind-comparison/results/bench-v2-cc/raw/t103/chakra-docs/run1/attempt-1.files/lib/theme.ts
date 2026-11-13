import {
  type SystemStyleObject,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"

// Lumen's identity lives here: tokens, semantic tokens and global styles.
// Components read it through the theme, so every screen follows it.

// Make the brand palette the default colorPalette: buttons, links, the current
// navigation item and focus rings all resolve colorPalette.* to the brand colour.
const brandPalette = "brand" as string as NonNullable<
  SystemStyleObject["colorPalette"]
>

const MONO = 'ui-monospace, "SFMono-Regular", Menlo, monospace'
const SANS = "ui-sans-serif, system-ui, sans-serif"

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: brandPalette,
    },
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "heading",
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
        // Lumen orange, anchored on #E8590C at 500.
        brand: {
          50: { value: "#fff4ed" },
          100: { value: "#ffe6d5" },
          200: { value: "#fecaaa" },
          300: { value: "#fdaa74" },
          400: { value: "#f77f3a" },
          500: { value: "#e8590c" },
          600: { value: "#c2480a" },
          700: { value: "#9a3a0b" },
          800: { value: "#7a2f0e" },
          900: { value: "#5a230d" },
          950: { value: "#2e1105" },
        },
        // Warm stone replaces the default cool grey, so every neutral
        // semantic token (bg, fg, border) turns warm.
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
      // 4px corners on buttons, inputs, cards, menus and dialogs.
      radii: {
        md: { value: "0.25rem" },
        lg: { value: "0.25rem" },
        xl: { value: "0.25rem" },
        l1: { value: "0.25rem" },
        l2: { value: "0.25rem" },
        l3: { value: "0.25rem" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          // Dark text on the orange fill reaches 5.5:1; white would only reach 3.6:1.
          contrast: { value: "{colors.gray.950}" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          muted: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          subtle: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
