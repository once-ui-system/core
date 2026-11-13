"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Container, Flex, IconButton, Link } from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "@/components/ui/color-mode";
import { PRODUCT_NAME } from "@/lib/data";

function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Until mounted, the server and the first client render output the same
  // neutral placeholder, so the resolved theme can never cause a mismatch.
  if (!mounted) {
    return <Box boxSize="8" aria-hidden="true" />;
  }

  return (
    <IconButton
      variant="ghost"
      size="sm"
      aria-label={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleColorMode}
    >
      {colorMode === "dark" ? <LuMoon /> : <LuSun />}
    </IconButton>
  );
}

export function SiteHeader({ maxW }: { maxW: string }) {
  return (
    <Box as="header" bg="bg" borderBottomWidth="1px">
      <Container maxW={maxW} py="3">
        <Flex align="center" justify="space-between">
          <Link asChild fontWeight="semibold" fontSize="lg" textDecoration="none">
            <NextLink href="/">{PRODUCT_NAME}</NextLink>
          </Link>
          <ThemeToggle />
        </Flex>
      </Container>
    </Box>
  );
}
