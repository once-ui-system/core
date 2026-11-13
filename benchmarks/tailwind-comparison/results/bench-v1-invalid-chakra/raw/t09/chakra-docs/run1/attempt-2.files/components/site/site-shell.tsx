import { Box, Flex } from "@chakra-ui/react"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg" color="fg">
      <Box
        as="a"
        href="#main-content"
        position="absolute"
        left="2"
        top="2"
        zIndex="skipLink"
        px="4"
        py="2"
        bg="brand.solid"
        color="brand.contrast"
        borderRadius="l2"
        fontWeight="medium"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to content
      </Box>
      <SiteHeader />
      <Box as="main" id="main-content" tabIndex={-1} flex="1" outline="none">
        {children}
      </Box>
      <SiteFooter />
    </Flex>
  )
}
