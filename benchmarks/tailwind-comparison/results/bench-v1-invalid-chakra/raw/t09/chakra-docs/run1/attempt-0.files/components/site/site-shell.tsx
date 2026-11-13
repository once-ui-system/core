import { Box, Flex, SkipNavContent, SkipNavLink } from "@chakra-ui/react"
import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg" color="fg">
      <SkipNavLink>Skip to content</SkipNavLink>
      <SiteHeader />
      <Box as="main" flex="1">
        <SkipNavContent />
        {children}
      </Box>
      <SiteFooter />
    </Flex>
  )
}
