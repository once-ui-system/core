"use client"

import { ChakraProvider, Theme } from "@chakra-ui/react"
import { system } from "@/lib/theme"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props}>
        {/* Brand is the default colour palette site-wide: primary buttons,
            switches and other palette-aware components pick it up without
            per-element props. An explicit colorPalette still wins. */}
        <Theme colorPalette="brand" display="contents">
          {props.children}
        </Theme>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
