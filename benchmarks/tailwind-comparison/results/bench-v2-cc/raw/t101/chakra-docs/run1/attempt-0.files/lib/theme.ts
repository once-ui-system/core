import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

// Lumen's visual identity, carried by the design system itself:
// tokens (brand teal, slate neutrals, fonts, 2px radii), semantic tokens
// (the "brand" colour palette) and compact default sizes for the recipes.
const config = defineConfig({
  globalCss: {
    ":where(a, button, input, select, textarea, summary, [tabindex])": {
      focusRingColor: "brand.focusRing",
    },
    a: { color: "brand.fg" },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#F0FDFA" },
          100: { value: "#CCFBF1" },
          200: { value: "#99F6E4" },
          300: { value: "#5EEAD4" },
          400: { value: "#2DD4BF" },
          500: { value: "#14B8A6" },
          600: { value: "#0F766E" },
          700: { value: "#115E59" },
          800: { value: "#134E4A" },
          900: { value: "#0B3B37" },
          950: { value: "#042F2E" },
        },
        // Cool slate neutrals replace the default gray scale.
        gray: {
          50: { value: "#F8FAFC" },
          100: { value: "#F1F5F9" },
          200: { value: "#E2E8F0" },
          300: { value: "#CBD5E1" },
          400: { value: "#94A3B8" },
          500: { value: "#64748B" },
          600: { value: "#475569" },
          700: { value: "#334155" },
          800: { value: "#1E293B" },
          900: { value: "#0F172A" },
          950: { value: "#020617" },
        },
      },
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
        l4: { value: "2px" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.300}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          solid: { value: "{colors.brand.600}" },
          focusRing: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
          border: { value: { _light: "{colors.brand.300}", _dark: "{colors.brand.700}" } },
        },
      },
    },
    // Compact density: small controls by default.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recipes: {
      button: { defaultVariants: { size: "sm" } } as any,
      input: { defaultVariants: { size: "sm" } } as any,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slotRecipes: {
      card: { defaultVariants: { size: "sm" } } as any,
      table: { defaultVariants: { size: "sm" } } as any,
    },
  },
})

export const system = createSystem(defaultConfig, config)
