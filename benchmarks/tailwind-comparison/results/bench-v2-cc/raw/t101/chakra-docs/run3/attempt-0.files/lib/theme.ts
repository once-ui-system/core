import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

/**
 * Lumen's visual identity, carried through Chakra's own theming:
 * brand colour palette, cool slate neutrals, 2px radii, Georgia headings,
 * system sans body text and compact default sizes for the core components.
 */
const config = defineConfig({
  globalCss: {
    body: {
      fontSize: "sm",
      lineHeight: "1.45",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Georgia, "Times New Roman", serif' },
        body: { value: "ui-sans-serif, system-ui, sans-serif" },
      },
      radii: {
        l1: { value: "2px" },
        l2: { value: "2px" },
        l3: { value: "2px" },
      },
      colors: {
        // Brand: Lumen teal. 700 is #0F766E.
        brand: {
          "50": { value: "#f0fdfa" },
          "100": { value: "#ccfbf1" },
          "200": { value: "#99f6e4" },
          "300": { value: "#5eead4" },
          "400": { value: "#2dd4bf" },
          "500": { value: "#14b8a6" },
          "600": { value: "#0d9488" },
          "700": { value: "#0f766e" },
          "800": { value: "#115e59" },
          "900": { value: "#134e4a" },
          "950": { value: "#042f2e" },
        },
        // Neutrals: cool slate grey replaces the default gray scale.
        gray: {
          "50": { value: "#f8fafc" },
          "100": { value: "#f1f5f9" },
          "200": { value: "#e2e8f0" },
          "300": { value: "#cbd5e1" },
          "400": { value: "#94a3b8" },
          "500": { value: "#64748b" },
          "600": { value: "#475569" },
          "700": { value: "#334155" },
          "800": { value: "#1e293b" },
          "900": { value: "#0f172a" },
          "950": { value: "#020617" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
          contrast: {
            value: { _light: "{colors.white}", _dark: "{colors.brand.950}" },
          },
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
          focusRing: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
        },
        // Focus rings are brand coloured everywhere, including neutral controls.
        gray: {
          focusRing: {
            value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" },
          },
        },
      },
    },
    recipes: {
      // Links use the brand colour.
      link: {
        variants: {
          variant: {
            underline: { color: "brand.fg" },
            plain: { color: "brand.fg" },
          },
        },
      },
      // Compact density: small controls by default.
      button: { defaultVariants: { size: "sm" } },
      input: { defaultVariants: { size: "sm" } },
      textarea: { defaultVariants: { size: "sm" } },
    },
    slotRecipes: {
      card: {
        slots: ["root", "header", "body", "footer", "title", "description"],
        defaultVariants: { size: "sm" },
      },
      table: {
        slots: [
          "root",
          "header",
          "body",
          "row",
          "columnHeader",
          "cell",
          "footer",
          "caption",
        ],
        defaultVariants: { size: "sm" },
      },
      nativeSelect: {
        slots: ["root", "field", "indicator"],
        defaultVariants: { size: "sm" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
