"use client"

import { Avatar, Box, Flex, HStack, Link as ChakraLink, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuLayoutGrid, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER, formatDate } from "@/lib/data"

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect width="28" height="28" rx="8" fill="#c2410c" />
      <circle cx="14" cy="14" r="4.2" fill="#fff" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2
        return <circle key={i} cx={14 + Math.cos(a) * 8.2} cy={14 + Math.sin(a) * 8.2} r="1.9" fill="#fed7aa" />
      })}
    </svg>
  )
}

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutGrid },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <ChakraLink
        href="#main"
        position="absolute"
        left="3"
        top="-60px"
        zIndex="popover"
        bg="bg"
        px="3"
        py="2"
        rounded="md"
        _focus={{ top: "3" }}
      >
        Skip to content
      </ChakraLink>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Flex align="center" gap={{ base: "3", md: "6" }} px={{ base: "3", md: "6" }} h="14" maxW="1800px" mx="auto">
          <HStack gap="2.5" flexShrink={0}>
            <BrandMark />
            <Text fontWeight="semibold" fontSize="md" letterSpacing="-0.01em" hideBelow="sm">
              {APP_NAME}
            </Text>
          </HStack>
          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    minH="9"
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                    bg={active ? "bg.muted" : "transparent"}
                    color={active ? "fg" : "fg.muted"}
                    _hover={{ bg: "bg.muted", textDecoration: "none", color: "fg" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      <item.icon aria-hidden="true" />
                      {item.label}
                    </NextLink>
                  </ChakraLink>
                )
              })}
            </HStack>
          </Box>
          <Box flex="1" minW="0" hideBelow="md" textAlign="center">
            <Text fontSize="sm" fontWeight="medium" truncate>
              {EVENT.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {formatDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>
          <Box flex="1" hideFrom="md" />
          <HStack gap="2" flexShrink={0}>
            <ColorModeButton />
            <HStack gap="2" hideBelow="sm">
              <Avatar.Root size="sm" colorPalette="orange">
                <Avatar.Fallback name={PLANNER.name} />
              </Avatar.Root>
              <Text fontSize="sm" hideBelow="lg">
                {PLANNER.name}
              </Text>
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" id="main" flex="1" minW="0">
        {children}
      </Box>
    </Flex>
  )
}
