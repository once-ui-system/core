"use client"

import {
  ChakraProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

// Seatwise brand: a deep rose-plum used for selection, focus and primary actions.
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#fbf3f7" },
          100: { value: "#f5e3ec" },
          200: { value: "#ebc7d9" },
          300: { value: "#dd9fbc" },
          400: { value: "#cb6f96" },
          500: { value: "#b24a78" },
          600: { value: "#96395f" },
          700: { value: "#7a2f4e" },
          800: { value: "#5f263f" },
          900: { value: "#471d31" },
          950: { value: "#2b111d" },
        },
      },
      fonts: {
        heading: {
          value:
            "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif",
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.500}" } },
          contrast: { value: "white" },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "{colors.brand.900}" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "{colors.brand.950}" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "{colors.brand.800}" } },
          focusRing: { value: { _light: "{colors.brand.600}", _dark: "{colors.brand.400}" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light" {...props} />
    </ChakraProvider>
  )
}
