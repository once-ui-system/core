"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { LuMenu, LuX } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { brand, navItems } from "@/lib/data"

function isActive(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false
  return pathname === href
}

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

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
          <Link
            asChild
            fontFamily="heading"
            fontSize="2xl"
            fontWeight="bold"
            color="fg"
            letterSpacing="tight"
            _hover={{ textDecoration: "none", color: "brand.fg" }}
          >
            <NextLink href="/" aria-label={`${brand.name} home`}>
              {brand.name}
            </NextLink>
          </Link>

          <HStack as="nav" aria-label="Main" gap="7" display={{ base: "none", md: "flex" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                color={isActive(pathname, item.href) ? "fg" : "fg.muted"}
                fontWeight="medium"
                textStyle="sm"
                _hover={{ color: "fg", textDecoration: "none" }}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </Link>
            ))}
          </HStack>

          <HStack gap="2">
            <ColorModeButton />
            <IconButton
              display={{ base: "inline-flex", md: "none" }}
              variant="ghost"
              size="sm"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <LuX /> : <LuMenu />}
            </IconButton>
          </HStack>
        </Flex>

        {open && (
          <Stack
            as="nav"
            id="mobile-nav"
            aria-label="Mobile"
            display={{ base: "flex", md: "none" }}
            gap="1"
            pb="4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                py="2"
                color="fg"
                fontWeight="medium"
                _hover={{ textDecoration: "none", color: "brand.fg" }}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                <NextLink href={item.href} onClick={() => setOpen(false)}>
                  <Text as="span">{item.label}</Text>
                </NextLink>
              </Link>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
