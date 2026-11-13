"use client"

import { Box, Flex, HStack, Link as ChakraLink, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { app, planner } from "@/lib/data"
import { usePlan } from "@/lib/store"

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
]

function LogoMark() {
  // A round table with eight seats.
  return (
    <chakra.svg
      viewBox="0 0 32 32"
      boxSize="9"
      aria-hidden="true"
      color="brand.contrast"
      bg="brand.solid"
      borderRadius="lg"
      p="1.5"
    >
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return (
          <circle
            key={i}
            cx={16 + Math.cos(a) * 11.5}
            cy={16 + Math.sin(a) * 11.5}
            r="2.4"
            fill="currentColor"
          />
        )
      })}
    </chakra.svg>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { brokenRules } = usePlan()

  return (
    <Box minH="100dvh" bg="bg.subtle" color="fg">
      <chakra.a
        href="#main"
        position="absolute"
        left="3"
        top="-100px"
        zIndex="popover"
        bg="bg.panel"
        px="3"
        py="2"
        borderRadius="md"
        borderWidth="1px"
        _focus={{ top: "3" }}
      >
        Skip to content
      </chakra.a>
      <chakra.header
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
        _print={{ display: "none" }}
      >
        <Flex
          maxW="1680px"
          mx="auto"
          px={{ base: "3", md: "5" }}
          h="14"
          align="center"
          justify="space-between"
          gap="3"
        >
          <HStack gap="3">
            <NextLink href="/" aria-label="Seatwise, plan">
              <HStack gap="2.5">
                <LogoMark />
                <Text
                  fontFamily="heading"
                  fontWeight="semibold"
                  fontSize="xl"
                  letterSpacing="-0.01em"
                >
                  {app.name}
                </Text>
              </HStack>
            </NextLink>
          </HStack>

          <chakra.nav aria-label="Main" flex="1" ms={{ base: "1", md: "6" }}>
            <HStack gap="1">
              {NAV.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    borderRadius="md"
                    fontWeight="medium"
                    fontSize="sm"
                    color={active ? "brand.fg" : "fg.muted"}
                    bg={active ? "brand.subtle" : "transparent"}
                    textDecoration="none"
                    _hover={{ bg: "bg.muted", textDecoration: "none" }}
                    _focusVisible={{ outlineColor: "brand.focusRing" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                      {item.href === "/" && brokenRules.length > 0 ? (
                        <chakra.span
                          ms="2"
                          px="1.5"
                          borderRadius="full"
                          bg="red.solid"
                          color="red.contrast"
                          fontSize="xs"
                          fontWeight="semibold"
                          aria-label={`${brokenRules.length} broken rules`}
                        >
                          {brokenRules.length}
                        </chakra.span>
                      ) : null}
                    </NextLink>
                  </ChakraLink>
                )
              })}
            </HStack>
          </chakra.nav>

          <HStack gap="2">
            <Text fontSize="sm" color="fg.muted" display={{ base: "none", md: "block" }}>
              {planner.name}
            </Text>
            <Avatar name={planner.name} size="sm" colorPalette="brand" />
            <ColorModeButton />
          </HStack>
        </Flex>
      </chakra.header>
      <Box
        as="main"
        id="main"
        maxW="1680px"
        mx="auto"
        px={{ base: "3", md: "5" }}
        py={{ base: "4", md: "5" }}
      >
        {children}
      </Box>
    </Box>
  )
}
