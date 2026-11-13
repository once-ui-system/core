"use client"

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Link as ChakraLink,
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
      bg="bg"
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

            <Box
              as="details"
              position="relative"
              display={{ base: "block", md: "none" }}
              css={{
                "& > summary": { listStyle: "none" },
                "& > summary::-webkit-details-marker": { display: "none" },
              }}
            >
              <Box
                as="summary"
                aria-label="Open navigation menu"
                cursor="pointer"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="8"
                borderRadius="l2"
                _hover={{ bg: "bg.muted" }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "brand.focusRing",
                }}
              >
                <LuMenu aria-hidden="true" />
              </Box>
              <Box
                as="nav"
                aria-label="Mobile"
                position="absolute"
                right="0"
                top="10"
                minW="44"
                py="1"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
                shadow="md"
              >
                {navLinks.map((link) => (
                  <ChakraLink
                    key={link.href}
                    asChild
                    display="block"
                    px="4"
                    py="2"
                    fontSize="sm"
                    color="fg"
                    _hover={{ bg: "bg.muted", textDecoration: "none" }}
                  >
                    <NextLink href={link.href}>{link.label}</NextLink>
                  </ChakraLink>
                ))}
              </Box>
            </Box>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
