"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Box, Button, Container, Flex, Text } from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode"
import { event, planner } from "@/lib/data"
import { formatDate } from "@/lib/seating"

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
]

function Logo() {
  return (
    <Flex align="center" gap="2.5">
      <Box
        aria-hidden
        boxSize="9"
        rounded="full"
        bg="teal.solid"
        position="relative"
        flexShrink={0}
        css={{
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "9px",
            borderRadius: "9999px",
            background: "var(--chakra-colors-teal-contrast)",
          },
        }}
      />
      <Text fontWeight="700" fontSize="lg" letterSpacing="-0.02em">
        Seatwise
      </Text>
    </Flex>
  )
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg/90"
        backdropFilter="blur(10px)"
        borderBottomWidth="1px"
      >
        <Container maxW="1680px" px={{ base: "4", md: "6" }}>
          <Flex align="center" gap={{ base: "3", md: "6" }} py="2.5" wrap="wrap">
            <Logo />
            <Box display={{ base: "none", lg: "block" }} lineHeight="1.25" minW="0">
              <Text fontWeight="600" fontSize="sm" truncate>
                {event.name}
              </Text>
              <Text fontSize="xs" color="fg.muted" truncate>
                {formatDate(event.date)} · {event.venue}
              </Text>
            </Box>
            <Flex as="nav" aria-label="Main" gap="1" ms="auto">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                return (
                  <Button
                    key={item.href}
                    asChild
                    size="sm"
                    variant={active ? "subtle" : "ghost"}
                    colorPalette={active ? "teal" : "gray"}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </NextLink>
                  </Button>
                )
              })}
            </Flex>
            <Flex align="center" gap="2">
              <Flex align="center" gap="2" display={{ base: "none", md: "flex" }}>
                <Flex
                  aria-hidden
                  boxSize="8"
                  rounded="full"
                  bg="bg.emphasized"
                  align="center"
                  justify="center"
                  fontSize="xs"
                  fontWeight="600"
                >
                  HB
                </Flex>
                <Text fontSize="sm" color="fg.muted">
                  {planner.name}
                </Text>
              </Flex>
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box as="main" id="main">
        <Container maxW="1680px" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
