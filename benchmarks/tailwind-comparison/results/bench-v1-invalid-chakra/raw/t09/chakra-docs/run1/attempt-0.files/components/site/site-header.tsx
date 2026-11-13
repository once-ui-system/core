"use client"

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Link as ChakraLink,
  Menu,
  Portal,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuMenu } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { brand, navLinks } from "@/lib/data"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg/90"
      backdropFilter="blur(8px)"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <Container maxW="6xl">
        <Flex h="16" align="center" justify="space-between" gap="4">
          <ChakraLink
            asChild
            fontFamily="heading"
            fontSize="2xl"
            fontWeight="bold"
            letterSpacing="tight"
            color="fg"
            _hover={{ textDecoration: "none", color: "brand.fg" }}
          >
            <NextLink href="/" aria-label={`${brand.name} home`}>
              {brand.name}
              <Box as="span" color="brand.solid" aria-hidden="true">
                .
              </Box>
            </NextLink>
          </ChakraLink>

          <HStack
            as="nav"
            aria-label="Primary"
            gap="6"
            display={{ base: "none", md: "flex" }}
          >
            {navLinks.map((link) => {
              const active = link.href === pathname
              return (
                <ChakraLink
                  key={link.href}
                  asChild
                  fontSize="sm"
                  fontWeight="medium"
                  color={active ? "brand.fg" : "fg.muted"}
                  _hover={{ color: "fg", textDecoration: "none" }}
                >
                  <NextLink
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </NextLink>
                </ChakraLink>
              )
            })}
          </HStack>

          <HStack gap="2">
            <Button
              asChild
              size="sm"
              display={{ base: "none", sm: "inline-flex" }}
            >
              <NextLink href="/pricing">Start free</NextLink>
            </Button>
            <ColorModeButton />

            <Box display={{ base: "block", md: "none" }}>
              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Open navigation menu"
                  >
                    <LuMenu />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content minW="44">
                      {navLinks.map((link) => (
                        <Menu.Item key={link.href} value={link.label} asChild>
                          <NextLink href={link.href}>{link.label}</NextLink>
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
