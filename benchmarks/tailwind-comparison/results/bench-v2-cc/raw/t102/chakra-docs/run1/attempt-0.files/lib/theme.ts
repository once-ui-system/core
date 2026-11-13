import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineSlotRecipe,
} from "@chakra-ui/react"

// Lumen's visual identity, carried through Chakra's own theming:
// brand colour (#DB2777) as the `brand` palette, warm sand neutrals replacing
// the `gray` scale, 16px radii, rounded headings, airy density.

const cardRecipe = defineSlotRecipe({
  slots: ["root", "header", "body", "footer", "title", "description"],
  variants: {
    size: {
      md: {
        root: { "--card-padding": "1.75rem" },
      },
    },
  },
})

const config = defineConfig({
  globalCss: {
    html: {
      // Every `colorPalette` inherits brand unless a component asks for another.
      colorPalette: "brand",
    },
    body: {
      bg: "bg",
      color: "fg",
    },
    "::selection": {
      bg: "brand.muted",
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
        // Warm sand replaces the neutral (gray) scale.
        gray: {
          50: { value: "#faf7f2" },
          100: { value: "#f4efe6" },
          200: { value: "#e8e0d0" },
          300: { value: "#d6cab4" },
          400: { value: "#b0a28a" },
          500: { value: "#7a6e58" },
          600: { value: "#5f5442" },
          700: { value: "#4a4132" },
          800: { value: "#342d22" },
          900: { value: "#231e16" },
          950: { value: "#17130d" },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "12px" },
        l2: { value: "16px" },
        l3: { value: "16px" },
      },
      colors: {
        brand: {
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: { value: { base: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { base: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { base: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { base: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          border: { value: { base: "{colors.brand.300}", _dark: "{colors.brand.700}" } },
          focusRing: { value: "{colors.brand.600}" },
        },
        bg: {
          DEFAULT: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.950}" } },
          subtle: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
          muted: { value: { base: "{colors.gray.200}", _dark: "{colors.gray.800}" } },
          emphasized: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.700}" } },
          panel: { value: { base: "white", _dark: "{colors.gray.900}" } },
        },
        fg: {
          subtle: { value: { base: "{colors.gray.500}", _dark: "{colors.gray.400}" } },
        },
      },
    },
    slotRecipes: {
      card: cardRecipe,
    },
    recipes: {
      // Airy density: generous, large touch targets.
      button: {
        variants: {
          size: {
            sm: { h: "10", minW: "10", px: "4", textStyle: "sm" },
            md: { h: "12", minW: "12", px: "5", textStyle: "md" },
            lg: { h: "14", minW: "14", px: "6", textStyle: "md" },
          },
        },
      },
      input: {
        variants: {
          size: {
            md: { h: "12", px: "4", textStyle: "md" },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
