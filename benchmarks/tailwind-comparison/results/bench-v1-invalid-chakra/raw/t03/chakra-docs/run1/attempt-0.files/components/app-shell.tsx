"use client"

import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Kbd,
  Text,
} from "@chakra-ui/react"
import {
  LuFolderKanban,
  LuLayoutDashboard,
  LuSearch,
  LuUsers,
} from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { Avatar } from "@/components/ui/avatar"
import { CommandPalette } from "@/components/command-palette"
import { InviteDialog } from "@/components/invite-dialog"
import { user } from "@/lib/data"

const NAV = [
  { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/projects", label: "Projects", icon: LuFolderKanban },
  { href: "/members", label: "Members", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent))
  }, [])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const openInvite = React.useCallback(() => setInviteOpen(true), [])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const shortcut = isMac ? "⌘K" : "Ctrl K"

  return (
    <Flex direction="column" minH="100vh" bg="bg.subtle">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Container maxW="6xl" px={{ base: "4", md: "6" }}>
          <Flex h="14" align="center" gap={{ base: "2", md: "6" }}>
            <NextLink href="/" aria-label="Lumen home">
              <HStack gap="2">
                <Box
                  boxSize="7"
                  rounded="md"
                  bg="blue.solid"
                  color="blue.contrast"
                  display="grid"
                  placeItems="center"
                  fontWeight="bold"
                  fontSize="sm"
                  aria-hidden="true"
                >
                  L
                </Box>
                <Text fontWeight="semibold" fontSize="lg" display={{ base: "none", sm: "block" }}>
                  Lumen
                </Text>
              </HStack>
            </NextLink>

            <Box
              as="nav"
              aria-label="Main"
              display={{ base: "none", md: "block" }}
            >
              <HStack gap="1" as="ul" listStyleType="none">
                {NAV.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <NextLink
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                      >
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="1.5"
                          rounded="md"
                          fontSize="sm"
                          fontWeight="medium"
                          color={active ? "fg" : "fg.muted"}
                          bg={active ? "bg.muted" : "transparent"}
                          _hover={{ bg: "bg.muted", color: "fg" }}
                        >
                          <item.icon aria-hidden="true" />
                          {item.label}
                        </Flex>
                      </NextLink>
                    </li>
                  )
                })}
              </HStack>
            </Box>

            <Flex flex="1" justify="flex-end" align="center" gap="2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
                aria-haspopup="dialog"
                display={{ base: "none", sm: "inline-flex" }}
                color="fg.muted"
                minW={{ sm: "44", md: "56" }}
                justifyContent="space-between"
              >
                <HStack gap="2">
                  <LuSearch aria-hidden="true" />
                  <span>Search…</span>
                </HStack>
                <Kbd suppressHydrationWarning>{shortcut}</Kbd>
              </Button>
              <IconButton
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
                aria-haspopup="dialog"
                display={{ base: "inline-flex", sm: "none" }}
              >
                <LuSearch />
              </IconButton>
              <ColorModeButton />
              <Avatar name={user.name} size="sm" />
            </Flex>
          </Flex>
        </Container>

        <Box
          as="nav"
          aria-label="Main mobile"
          display={{ base: "block", md: "none" }}
          borderTopWidth="1px"
          borderColor="border"
        >
          <Container maxW="6xl" px={{ base: "2", md: "6" }}>
            <HStack as="ul" listStyleType="none" gap="1" py="1.5" overflowX="auto">
              {NAV.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <NextLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="1.5"
                        rounded="md"
                        fontSize="sm"
                        fontWeight="medium"
                        color={active ? "fg" : "fg.muted"}
                        bg={active ? "bg.muted" : "transparent"}
                      >
                        <item.icon aria-hidden="true" />
                        {item.label}
                      </Flex>
                    </NextLink>
                  </li>
                )
              })}
            </HStack>
          </Container>
        </Box>
      </Box>

      <Box as="main" flex="1" id="main">
        <Container maxW="6xl" px={{ base: "4", md: "6" }} py={{ base: "6", md: "8" }}>
          {children}
        </Container>
      </Box>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onInviteMember={openInvite}
      />
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </Flex>
  )
}
