import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen design system.
 *
 * - brand colour #E8590C is the primary colour: buttons, links, focus rings
 * - warm stone-grey replaces the default neutral scale
 * - 4px corner radius on buttons, inputs, cards and menus
 * - Georgia headings, system sans body (both system fonts, nothing loaded)
 *
 * Chakra components default to the `gray` palette for their solid fills and
 * focus rings, so the `gray` palette's interactive semantic tokens are pointed
 * at the brand colour while its raw scale stays warm stone grey.
 */
const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "gray",
    },
    body: {
      bg: "bg",
      color: "fg",
    },
    "a:not([class])": {
      color: "brand.fg",
    },
    "*::selection": {
      bg: "brand.muted",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        // 4px on buttons, inputs, cards and menus (they use l1/l2/l3, sm, md)
        xs: { value: "4px" },
        sm: { value: "4px" },
        md: { value: "4px" },
        lg: { value: "4px" },
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
      colors: {
        brand: {
          50: { value: "#FFF4EC" },
          100: { value: "#FFE5D1" },
          200: { value: "#FFC9A1" },
          300: { value: "#FFA666" },
          400: { value: "#F57F33" },
          500: { value: "#E8590C" },
          600: { value: "#C94A08" },
          700: { value: "#A23B09" },
          800: { value: "#7C2E0C" },
          900: { value: "#5A230C" },
          950: { value: "#331205" },
        },
        // warm stone grey
        gray: {
          50: { value: "#FAFAF9" },
          100: { value: "#F5F5F4" },
          200: { value: "#E7E5E4" },
          300: { value: "#D6D3D1" },
          400: { value: "#A8A29E" },
          500: { value: "#78716C" },
          600: { value: "#57534E" },
          700: { value: "#44403C" },
          800: { value: "#292524" },
          900: { value: "#1C1917" },
          950: { value: "#0C0A09" },
        },
      },
    },
    semanticTokens: {
      colors: {
        // page surfaces and text
        bg: {
          DEFAULT: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          subtle: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
          inverted: {
            value: { _light: "{colors.gray.950}", _dark: "{colors.gray.50}" },
          },
          panel: {
            value: { _light: "white", _dark: "{colors.gray.900}" },
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.gray.950}", _dark: "{colors.gray.50}" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" },
          },
          subtle: {
            value: { _light: "{colors.gray.500}", _dark: "{colors.gray.500}" },
          },
          inverted: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
        },

        // brand palette (usable as colorPalette="brand")
        brand: {
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" },
          },
          subtle: {
            value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" },
          },
          muted: {
            value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" },
          },
          emphasized: {
            value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" },
          },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
          border: {
            value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" },
          },
        },

        // gray palette: neutral scale stays stone, interactive tokens go brand
        gray: {
          contrast: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          fg: {
            value: { _light: "{colors.gray.800}", _dark: "{colors.gray.100}" },
          },
          subtle: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
          solid: { value: "{colors.brand.500}" },
          focusRing: { value: "{colors.brand.500}" },
          border: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
        },
      },
    },
    recipes: {
      button: {
        variants: {
          variant: {
            solid: {
              bg: "brand.solid",
              color: "brand.contrast",
              _hover: { bg: "brand.600" },
              _expanded: { bg: "brand.600" },
            },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
