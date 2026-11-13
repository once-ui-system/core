"use client"

import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Button,
  Container,
  Flex,
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
import { CommandPalette } from "@/components/command-palette"
import { InviteDialog } from "@/components/invite-dialog"
import { initials, user } from "@/lib/data"

const NAV = [
  { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/projects", label: "Projects", icon: LuFolderKanban },
  { href: "/members", label: "Members", icon: LuUsers },
]

function NavList({
  pathname,
  label,
}: {
  pathname: string
  label: string
}) {
  return (
    <Box as="nav" aria-label={label}>
      <Flex as="ul" listStyleType="none" gap="1" m="0" p="0" overflowX="auto">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Box as="li" key={item.href} flexShrink={0}>
              <NextLink
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                <Flex
                  as="span"
                  display="inline-flex"
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
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </Flex>
              </NextLink>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent))
    setMounted(true)
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
              <Flex as="span" display="inline-flex" align="center" gap="2">
                <Box
                  as="span"
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
                <Text
                  as="span"
                  fontWeight="semibold"
                  fontSize="lg"
                  display={{ base: "none", sm: "inline" }}
                >
                  Lumen
                </Text>
              </Flex>
            </NextLink>

            <Box display={{ base: "none", md: "block" }}>
              <NavList pathname={pathname} label="Main" />
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
                <Box as="span" display="inline-flex" alignItems="center" gap="2">
                  <LuSearch aria-hidden="true" />
                  <span>Search…</span>
                </Box>
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
              <Box
                as="span"
                boxSize="8"
                rounded="full"
                bg="bg.emphasized"
                color="fg"
                display="grid"
                placeItems="center"
                fontSize="xs"
                fontWeight="semibold"
                title={user.name}
                aria-label={`Signed in as ${user.name}`}
                role="img"
              >
                {initials(user.name)}
              </Box>
            </Flex>
          </Flex>
        </Container>

        <Box
          display={{ base: "block", md: "none" }}
          borderTopWidth="1px"
          borderColor="border"
        >
          <Container maxW="6xl" px="2" py="1.5">
            <NavList pathname={pathname} label="Main mobile" />
          </Container>
        </Box>
      </Box>

      <Box as="main" flex="1" id="main">
        <Container maxW="6xl" px={{ base: "4", md: "6" }} py={{ base: "6", md: "8" }}>
          {children}
        </Container>
      </Box>

      {mounted ? (
        <>
          <CommandPalette
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            onInviteMember={openInvite}
          />
          <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
        </>
      ) : null}
    </Flex>
  )
}
