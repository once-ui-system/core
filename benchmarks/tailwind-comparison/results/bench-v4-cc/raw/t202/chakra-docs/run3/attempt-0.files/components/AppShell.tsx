"use client"

import { Box, Flex, Heading, HStack, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { LuCalendar, LuLayoutGrid, LuMapPin, LuUsers } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { APP_NAME, EVENT, PLANNER } from "@/lib/data"
import { initials } from "@/components/GuestBits"

const NavLink = chakra(NextLink)

const NAV = [
  { href: "/", label: "Plan", icon: LuLayoutGrid },
  { href: "/guests", label: "Guests", icon: LuUsers },
]

const dateLabel = new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Box minH="100dvh" bg="bg" colorPalette="teal">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
      >
        <Flex maxW="1680px" mx="auto" px={{ base: "3", md: "6" }} h="14" align="center" gap={{ base: "2", md: "6" }}>
          <HStack gap="2">
            <Flex
              aria-hidden
              w="8"
              h="8"
              borderRadius="lg"
              bg="colorPalette.solid"
              color="colorPalette.contrast"
              align="center"
              justify="center"
              fontWeight="bold"
            >
              S
            </Flex>
            <Text fontWeight="semibold" fontSize="lg" letterSpacing="-0.01em">
              {APP_NAME}
            </Text>
          </HStack>
          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    display="inline-flex"
                    alignItems="center"
                    gap="2"
                    px="3"
                    h="9"
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                    color={active ? "colorPalette.fg" : "fg.muted"}
                    bg={active ? "colorPalette.subtle" : "transparent"}
                    _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted", textDecoration: "none" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "colorPalette.focusRing" }}
                  >
                    <item.icon aria-hidden />
                    {item.label}
                  </NavLink>
                )
              })}
            </HStack>
          </Box>
          <Box flex="1" />
          <ColorModeButton />
          <HStack gap="2" title={`Planner: ${PLANNER.name}`}>
            <Flex
              aria-hidden
              w="8"
              h="8"
              borderRadius="full"
              bg="bg.emphasized"
              align="center"
              justify="center"
              fontSize="xs"
              fontWeight="semibold"
            >
              {initials(PLANNER.name)}
            </Flex>
            <Text display={{ base: "none", md: "block" }} fontSize="sm" color="fg.muted">
              {PLANNER.name}
            </Text>
          </HStack>
        </Flex>
      </Box>

      <Box as="main" maxW="1680px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        <Box mb="4">
          <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="-0.02em">
            {title}
          </Heading>
          <Flex mt="1" gap={{ base: "1", md: "4" }} direction={{ base: "column", md: "row" }} color="fg.muted" fontSize="sm">
            <Text fontWeight="medium" color="fg">
              {EVENT.name}
            </Text>
            <HStack gap="1">
              <LuCalendar aria-hidden />
              <Text>{dateLabel}</Text>
            </HStack>
            <HStack gap="1">
              <LuMapPin aria-hidden />
              <Text>{EVENT.venue}</Text>
            </HStack>
          </Flex>
        </Box>
        {children}
      </Box>
    </Box>
  )
}
