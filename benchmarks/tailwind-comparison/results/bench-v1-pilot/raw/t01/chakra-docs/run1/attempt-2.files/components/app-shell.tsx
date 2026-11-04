"use client";

import { Box, ClientOnly, Flex, SkipNavContent, SkipNavLink } from "@chakra-ui/react";
import { ShellChrome } from "@/components/shell-chrome";

/**
 * Shared layout for every screen. The interactive chrome (sidebar, drawer,
 * header) renders on the client only; until then a plain frame with the page
 * content is shown, so server HTML and the first client render are identical.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const main = (
    <Box as="main" flex="1" px={{ base: "4", md: "8" }} py={{ base: "6", md: "8" }}>
      <SkipNavContent />
      <Box maxW="6xl" mx="auto">
        {children}
      </Box>
    </Box>
  );

  return (
    <>
      <SkipNavLink>Skip to content</SkipNavLink>
      <ClientOnly
        fallback={
          <Flex minH="100dvh" bg="bg.subtle" direction="column">
            {main}
          </Flex>
        }
      >
        <ShellChrome>{main}</ShellChrome>
      </ClientOnly>
    </>
  );
}
