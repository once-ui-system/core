"use client"

import {
  Box,
  Button,
  Flex,
  IconButton,
  Separator,
  Span,
  Text,
  chakra,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronDown,
  LuChevronRight,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSettings,
} from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import {
  BreadcrumbCurrentLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb"
import { ColorModeButton } from "@/components/ui/color-mode"
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { type NavItem, findNav, isActive, navGroups } from "@/lib/nav"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_COLLAPSED = "4.25rem"

const focusStyles = {
  outline: "2px solid",
  outlineColor: "colorPalette.focusRing",
  outlineOffset: "2px",
} as const

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <NextLink
      href="/"
      aria-label="Lumen, go to overview"
      style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
    >
      <Flex
        boxSize="8"
        flexShrink={0}
        alignItems="center"
        justifyContent="center"
        borderRadius="l2"
        bg="colorPalette.solid"
        color="colorPalette.contrast"
        fontFamily="heading"
        fontWeight="bold"
        aria-hidden="true"
      >
        L
      </Flex>
      {!collapsed && (
        <Text fontFamily="heading" fontWeight="bold" fontSize="lg" letterSpacing="tight">
          Lumen
        </Text>
      )}
    </NextLink>
  )
}

function NavLinkItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const link = (
    <chakra.span display="block">
      <Box asChild>
        <NextLink
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <Flex
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            gap="3"
            h="9"
            px={collapsed ? "0" : "3"}
            borderRadius="l2"
            borderStartWidth="2px"
            borderStartColor={active ? "colorPalette.solid" : "transparent"}
            bg={active ? "colorPalette.subtle" : "transparent"}
            color={active ? "colorPalette.fg" : "fg.muted"}
            fontSize="sm"
            fontWeight="medium"
            _hover={active ? undefined : { bg: "bg.muted", color: "fg" }}
          >
            <Icon size={18} aria-hidden="true" style={{ flexShrink: 0 }} />
            {!collapsed && <Span truncate>{item.label}</Span>}
          </Flex>
        </NextLink>
      </Box>
    </chakra.span>
  )

  if (!collapsed) return link
  return (
    <Tooltip content={item.label} positioning={{ placement: "right" }}>
      {link}
    </Tooltip>
  )
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [closed, setClosed] = React.useState<Record<string, boolean>>({})

  return (
    <chakra.nav aria-label="Primary" flex="1" overflowY="auto" p="3">
      <chakra.ul listStyle="none" m="0" p="0" display="flex" flexDirection="column" gap={collapsed ? "2" : "4"}>
        {navGroups.map((group, index) => {
          const open = collapsed || !closed[group.id]
          return (
            <chakra.li key={group.id} listStyle="none">
              {collapsed ? (
                index > 0 ? <Separator mb="2" /> : null
              ) : (
                <chakra.button
                  type="button"
                  onClick={() =>
                    setClosed((prev) => ({ ...prev, [group.id]: !prev[group.id] }))
                  }
                  aria-expanded={open}
                  display="flex"
                  w="full"
                  h="7"
                  px="3"
                  mb="1"
                  alignItems="center"
                  justifyContent="space-between"
                  borderRadius="l2"
                  color="fg.muted"
                  fontSize="xs"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  cursor="pointer"
                  _hover={{ color: "fg" }}
                  _focusVisible={focusStyles}
                >
                  {group.label}
                  {open ? (
                    <LuChevronDown aria-hidden="true" />
                  ) : (
                    <LuChevronRight aria-hidden="true" />
                  )}
                </chakra.button>
              )}
              {open && (
                <chakra.ul
                  aria-label={group.label}
                  listStyle="none"
                  m="0"
                  p="0"
                  display="flex"
                  flexDirection="column"
                  gap="1"
                >
                  {group.items.map((item) => (
                    <chakra.li key={item.href} listStyle="none">
                      <NavLinkItem
                        item={item}
                        active={isActive(pathname, item.href)}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                      />
                    </chakra.li>
                  ))}
                </chakra.ul>
              )}
            </chakra.li>
          )
        })}
      </chakra.ul>
    </chakra.nav>
  )
}

function SidebarUser({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="3"
      p="3"
      borderTopWidth="1px"
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.email}
          </Text>
        </Box>
      )}
    </Flex>
  )
}

function Header({
  collapsed,
  onToggleCollapsed,
  onOpenMenu,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
  onOpenMenu: () => void
}) {
  const pathname = usePathname()
  const current = findNav(pathname)

  return (
    <chakra.header
      position="sticky"
      top="0"
      zIndex="sticky"
      display="flex"
      h="14"
      px={{ base: "4", md: "6" }}
      alignItems="center"
      gap="3"
      bg="bg"
      borderBottomWidth="1px"
    >
      <IconButton
        hideFrom="md"
        variant="ghost"
        size="sm"
        aria-label="Open navigation menu"
        onClick={onOpenMenu}
      >
        <LuMenu />
      </IconButton>
      <IconButton
        hideBelow="md"
        variant="ghost"
        size="sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        onClick={onToggleCollapsed}
      >
        {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
      </IconButton>

      <Box flex="1" minW="0">
        {current ? (
          <BreadcrumbRoot size="sm" separator={<LuChevronRight aria-hidden="true" />}>
            <Span color="fg.muted">{current.group.label}</Span>
            <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
          </BreadcrumbRoot>
        ) : (
          <Text fontSize="sm" color="fg.muted">
            Lumen
          </Text>
        )}
      </Box>

      <ColorModeButton />

      <MenuRoot positioning={{ placement: "bottom-end" }}>
        <MenuTrigger asChild>
          <Button variant="ghost" size="sm" px="1" aria-label="Account menu">
            <Avatar name={user.name} size="xs" />
            <Span hideBelow="md">{user.name}</Span>
          </Button>
        </MenuTrigger>
        <MenuContent minW="12rem">
          <Box px="3" py="2">
            <Text fontSize="sm" fontWeight="medium">
              {user.name}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {user.email} · {user.role}
            </Text>
          </Box>
          <Separator />
          <MenuItem value="settings" asChild>
            <NextLink href="/settings">
              <LuSettings /> Settings
            </NextLink>
          </MenuItem>
          <MenuItem
            value="sign-out"
            onClick={() =>
              toaster.create({
                title: "Sign out is not available in this preview",
                type: "info",
              })
            }
          >
            <LuLogOut /> Sign out
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </chakra.header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <chakra.a
        href="#main-content"
        position="absolute"
        top="2"
        left="2"
        zIndex="skipLink"
        px="3"
        py="2"
        bg="bg.panel"
        borderWidth="1px"
        borderRadius="l2"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "none" }}
      >
        Skip to content
      </chakra.a>

      <chakra.aside
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH}
        bg="bg.subtle"
        borderEndWidth="1px"
        overflow="hidden"
        transition="width 0.2s ease"
      >
        <Flex
          h="14"
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          px="4"
          borderBottomWidth="1px"
        >
          <Logo collapsed={collapsed} />
        </Flex>
        <SidebarNav collapsed={collapsed} />
        <SidebarUser collapsed={collapsed} />
      </chakra.aside>

      <DrawerRoot
        placement="start"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent bg="bg.subtle">
          <DrawerHeader borderBottomWidth="1px">
            <DrawerTitle>Navigation</DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="0" display="flex" flexDirection="column">
            <SidebarNav collapsed={false} onNavigate={() => setDrawerOpen(false)} />
            <SidebarUser collapsed={false} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Header
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <chakra.main
          id="main-content"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: "4", md: "6", lg: "8" }}
          py={{ base: "6", md: "8" }}
          _focusVisible={{ outline: "none" }}
        >
          {children}
        </chakra.main>
      </Flex>
    </Flex>
  )
}
