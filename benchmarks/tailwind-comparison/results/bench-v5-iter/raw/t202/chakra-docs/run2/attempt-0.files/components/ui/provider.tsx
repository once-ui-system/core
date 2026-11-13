"use client"

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const config = defineConfig({
  globalCss: {
    body: {
      bg: "bg.subtle",
      color: "fg",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value:
            'ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
        },
        body: {
          value:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
      },
      colors: {
        brand: {
          50: { value: "#eef7f3" },
          100: { value: "#d6ebe2" },
          200: { value: "#b0d7c7" },
          300: { value: "#82bda6" },
          400: { value: "#55a085" },
          500: { value: "#3a8569" },
          600: { value: "#2e6c55" },
          700: { value: "#265745" },
          800: { value: "#1f4538" },
          900: { value: "#17342a" },
          950: { value: "#0d1f19" },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          contrast: { value: { _light: "white", _dark: "{colors.brand.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.200}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" } },
        },
      },
    },
  },
})

const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
