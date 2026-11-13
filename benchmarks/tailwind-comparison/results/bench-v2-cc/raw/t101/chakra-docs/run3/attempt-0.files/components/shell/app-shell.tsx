"use client"

import { Avatar } from "@/components/ui/avatar"
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
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
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { findNav } from "@/lib/nav"
import { Box, Button, Flex, IconButton, Text, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LuChevronDown,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu"
import { NavLink, SidebarNav } from "./sidebar-nav"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink
      href="/"
      aria-label="Lumen home"
      display="flex"
      alignItems="center"
      gap="2"
      borderRadius="l2"
      textDecoration="none"
      color="fg"
      focusVisibleRing="outside"
    >
      <Box
        aria-hidden
        display="grid"
        placeItems="center"
        w="6"
        h="6"
        flexShrink={0}
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
        fontFamily="heading"
        fontWeight="bold"
        fontSize="sm"
      >
        L
      </Box>
      {!collapsed && (
        <Text
          as="span"
          fontFamily="heading"
          fontWeight="semibold"
          fontSize="lg"
          letterSpacing="-0.01em"
        >
          Lumen
        </Text>
      )}
    </NavLink>
  )
}

function UserMenu() {
  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          px="1"
          aria-label={`Account menu, ${user.name}`}
        >
          <Avatar size="2xs" name={user.name} colorPalette="brand" />
          <Text as="span" hideBelow="md" fontWeight="medium">
            {user.name}
          </Text>
          <LuChevronDown aria-hidden />
        </Button>
      </MenuTrigger>
      <MenuContent minW="56">
        <Box px="3" py="2">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text fontSize="xs" color="fg.muted">
            {user.email}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Role: {user.role}
          </Text>
        </Box>
        <MenuSeparator />
        <MenuItem value="settings" asChild>
          <NextLink href="/settings">Settings</NextLink>
        </MenuItem>
        <MenuItem value="projects" asChild>
          <NextLink href="/projects">Projects</NextLink>
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const current = findNav(pathname)

  // Close the phone drawer when the viewport grows to the desktop layout.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 48em)")
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false)
    }
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"

  return (
    <Flex minH="100dvh" bg="bg">
      <chakra.a
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="skipLink"
        px="3"
        py="1.5"
        bg="bg"
        borderWidth="1px"
        borderRadius="l2"
        fontSize="sm"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </chakra.a>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        hideBelow="md"
        flexShrink={0}
        w={collapsed ? "14" : "60"}
        transition="width 0.15s ease"
        _motionReduce={{ transition: "none" }}
        borderEndWidth="1px"
        bg="bg.subtle"
      >
        <Flex direction="column" position="sticky" top="0" h="100dvh">
          <Flex
            h="12"
            align="center"
            justify={collapsed ? "center" : "flex-start"}
            px="3"
            borderBottomWidth="1px"
          >
            <Brand collapsed={collapsed} />
          </Flex>
          <Box flex="1" overflowY="auto" px="2" py="3">
            <SidebarNav collapsed={collapsed} />
          </Box>
          <Box p="2" borderTopWidth="1px">
            <Tooltip
              content={toggleLabel}
              positioning={{ placement: "right" }}
              disabled={!collapsed}
            >
              <Button
                variant="ghost"
                size="xs"
                w="100%"
                justifyContent={collapsed ? "center" : "flex-start"}
                color="fg.muted"
                aria-label={toggleLabel}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? (
                  <LuPanelLeftOpen aria-hidden />
                ) : (
                  <LuPanelLeftClose aria-hidden />
                )}
                {!collapsed && "Collapse"}
              </Button>
            </Tooltip>
            <Flex
              mt="2"
              px="1"
              align="center"
              gap="2"
              justify={collapsed ? "center" : "flex-start"}
            >
              <Avatar size="xs" name={user.name} colorPalette="brand" />
              {!collapsed && (
                <Box minW="0">
                  <Text fontSize="xs" fontWeight="semibold" truncate>
                    {user.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {user.role}
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Phone navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(event) => setDrawerOpen(event.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent bg="bg.subtle">
          <DrawerHeader h="12" py="0" display="flex" alignItems="center">
            <DrawerTitle fontFamily="heading" fontSize="lg">
              Lumen
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody px="2" py="3">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="12"
          px={{ base: "2", md: "5" }}
          borderBottomWidth="1px"
          bg="bg"
        >
          <Flex h="100%" align="center" gap="2">
            <IconButton
              hideFrom="md"
              variant="ghost"
              size="sm"
              aria-label="Open navigation menu"
              onClick={() => setDrawerOpen(true)}
            >
              <LuMenu aria-hidden />
            </IconButton>
            <Box flex="1" minW="0" overflow="hidden">
              <BreadcrumbRoot size="sm">
                <BreadcrumbLink asChild>
                  <NextLink href="/">Lumen</NextLink>
                </BreadcrumbLink>
                {current ? (
                  <Text as="span" color="fg.muted">
                    {current.group.label}
                  </Text>
                ) : null}
                {current ? (
                  <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
                ) : (
                  <BreadcrumbCurrentLink>Not found</BreadcrumbCurrentLink>
                )}
              </BreadcrumbRoot>
            </Box>
            <ColorModeButton />
            <UserMenu />
          </Flex>
        </Box>
        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          w="100%"
          maxW="1200px"
          px={{ base: "3", md: "5" }}
          py={{ base: "4", md: "5" }}
          _focusVisible={{ outline: "none" }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
