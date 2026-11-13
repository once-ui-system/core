import { Box, SkipNavContent, SkipNavLink } from "@chakra-ui/react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" display="flex" flexDirection="column">
      <SkipNavLink>Skip to content</SkipNavLink>
      <SiteHeader />
      <Box as="main" flex="1">
        <SkipNavContent />
        {children}
      </Box>
      <SiteFooter />
    </Box>
  )
}
