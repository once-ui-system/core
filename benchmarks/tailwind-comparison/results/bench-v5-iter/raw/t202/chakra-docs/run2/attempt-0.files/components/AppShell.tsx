"use client"

import { Box, Flex, HStack, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { LuArmchair, LuLayoutDashboard, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data"

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutDashboard },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Flex direction="column" minH="100dvh">
      <chakra.a
        href="#main"
        position="absolute"
        left="3"
        top="-4rem"
        zIndex="popover"
        bg="bg.panel"
        px="3"
        py="2"
        rounded="md"
        borderWidth="1px"
        _focus={{ top: "3" }}
      >
        Skip to content
      </chakra.a>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
      >
        <Flex
          maxW="96rem"
          mx="auto"
          px={{ base: "3", md: "6" }}
          py="2"
          align="center"
          gap={{ base: "3", md: "6" }}
          minH="14"
        >
          <Flex align="center" gap="2" flexShrink={0}>
            <Flex boxSize="8" rounded="lg" bg="brand.solid" color="brand.contrast" align="center" justify="center">
              <LuArmchair aria-hidden />
            </Flex>
            <Text fontFamily="heading" fontWeight="bold" fontSize="xl" letterSpacing="-0.01em">
              {APP_NAME}
            </Text>
          </Flex>

          <Box display={{ base: "none", md: "block" }} minW="0" borderStartWidth="1px" ps="5">
            <Text fontWeight="semibold" fontSize="sm" truncate>
              {EVENT.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {formatEventDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Box>

          <Box flex="1" />

          <chakra.nav aria-label="Main">
            <HStack gap="1" as="ul" listStyleType="none" m="0" p="0">
              {NAV.map((n) => {
                const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)
                const Icon = n.icon
                return (
                  <li key={n.href}>
                    <chakra.span display="contents">
                      <NextLink href={n.href} aria-current={active ? "page" : undefined} style={{ textDecoration: "none" }}>
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="2"
                          rounded="lg"
                          fontSize="sm"
                          fontWeight="semibold"
                          bg={active ? "brand.muted" : "transparent"}
                          color={active ? "brand.fg" : "fg.muted"}
                          _hover={{ bg: active ? "brand.muted" : "bg.muted" }}
                        >
                          <Icon aria-hidden />
                          {n.label}
                        </Flex>
                      </NextLink>
                    </chakra.span>
                  </li>
                )
              })}
            </HStack>
          </chakra.nav>

          <Flex align="center" gap="2" flexShrink={0}>
            <ColorModeButton />
            <Flex
              align="center"
              gap="2"
              title={PLANNER.name}
              display={{ base: "none", sm: "flex" }}
            >
              <Flex
                boxSize="8"
                rounded="full"
                bg="bg.emphasized"
                align="center"
                justify="center"
                fontSize="xs"
                fontWeight="bold"
                aria-hidden
              >
                {initials(PLANNER.name)}
              </Flex>
              <Text fontSize="sm" display={{ base: "none", lg: "block" }}>
                {PLANNER.name}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box display={{ base: "block", md: "none" }} px="3" pb="2">
          <Text fontWeight="semibold" fontSize="sm" truncate>
            {EVENT.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {formatEventDate(EVENT.date)} · {EVENT.venue}
          </Text>
        </Box>
      </Box>
      <Box as="main" id="main" flex="1" maxW="96rem" w="full" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Flex>
  )
}
