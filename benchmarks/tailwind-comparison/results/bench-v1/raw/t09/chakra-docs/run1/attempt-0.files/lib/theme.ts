import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen brand theme.
 *
 * All brand decisions live here, in the design system, so components never
 * carry one-off colours, radii or fonts:
 *  - `brand` palette built around #E8590C (primary buttons, links, focus rings)
 *  - `gray` scale replaced by a warm stone grey (every neutral surface/border/text)
 *  - 4px radii for buttons, inputs, cards and menus (via l1/l2/l3 + sm/md)
 *  - Georgia heading font, system sans body font (no fonts are loaded)
 */
const config = defineConfig({
  globalCss: {
    html: { fontFamily: "body" },
    "*::selection": { bg: "brand.muted" },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        // Brand colour #E8590C sits at 500.
        brand: {
          50: { value: "#FFF4EC" },
          100: { value: "#FFE5D1" },
          200: { value: "#FFC9A1" },
          300: { value: "#FFA66B" },
          400: { value: "#F77F37" },
          500: { value: "#E8590C" },
          600: { value: "#C2410C" },
          700: { value: "#9A330B" },
          800: { value: "#732709" },
          900: { value: "#4D1A06" },
          950: { value: "#2E0F03" },
        },
        // Warm stone grey: replaces the default cool gray scale.
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
      // Chakra recipes use the semantic l1/l2/l3 radii (buttons, inputs, cards,
      // menus), so pinning them to 4px applies the rule through the system.
      radii: {
        xs: { value: "2px" },
        sm: { value: "4px" },
        md: { value: "4px" },
        l1: { value: "4px" },
        l2: { value: "4px" },
        l3: { value: "4px" },
      },
    },
    semanticTokens: {
      colors: {
        // Full colour-palette contract so `colorPalette="brand"` works.
        brand: {
          // 600 keeps white text on solid buttons above 4.5:1 contrast.
          solid: { value: "{colors.brand.600}" },
          contrast: { value: "white" },
          fg: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
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
          focusRing: { value: "{colors.brand.500}" },
        },
        // Neutral components (inputs, menus, accordion, switch) read the gray
        // palette's focus ring, so point it at the brand colour as well.
        gray: {
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
