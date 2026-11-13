"use client"

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Separator,
  SkipNavContent,
  SkipNavLink,
  Text,
} from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
} from "react-icons/lu"
import { NavList } from "@/components/nav-list"
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
import { Tooltip } from "@/components/ui/tooltip"
import { getBreadcrumbs, user } from "@/lib/data"

function BrandMark() {
  return (
    <Flex
      boxSize="8"
      rounded="md"
      bg="blue.solid"
      color="blue.contrast"
      align="center"
      justify="center"
      flexShrink="0"
      aria-hidden="true"
    >
      <LuSparkles />
    </Flex>
  )
}

function BrandLink({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" aria-label="Lumen home">
      <HStack gap="2" justify={collapsed ? "center" : "flex-start"}>
        <BrandMark />
        {!collapsed && (
          <Text fontWeight="bold" fontSize="lg" letterSpacing="tight">
            Lumen
          </Text>
        )}
      </HStack>
    </Link>
  )
}

function UserBadge({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"} minW="0">
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role}
          </Text>
        </Box>
      )}
    </HStack>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = getBreadcrumbs(pathname)

  // Close the phone drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s ease"
        overflow="hidden"
      >
        <Flex h="14" align="center" justify="center" px={collapsed ? "0" : "4"}>
          <Box flex={collapsed ? "none" : "1"}>
            <BrandLink collapsed={collapsed} />
          </Box>
        </Flex>
        <Box flex="1" overflowY="auto" overflowX="hidden" px="2" py="2">
          <NavList collapsed={collapsed} />
        </Box>
        <Separator />
        <Box p="3">
          <UserBadge collapsed={collapsed} />
        </Box>
      </Flex>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          align="center"
          gap="2"
          px={{ base: "3", md: "6" }}
          borderBottomWidth="1px"
          bg="bg"
        >
          {/* Phones: menu button opens the navigation drawer */}
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          {/* Desktop: collapse / expand the sidebar */}
          <Box display={{ base: "none", md: "block" }}>
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
          </Box>

          <Box flex="1" minW="0">
            <BreadcrumbRoot size="sm">
              {crumbs.map((crumb, index) =>
                index === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={crumb.label}>
                    {crumb.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Text as="span" key={crumb.label} color="fg.muted">
                    {crumb.label}
                  </Text>
                ),
              )}
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
          <Box display={{ base: "none", sm: "block" }}>
            <Avatar name={user.name} size="xs" />
          </Box>
        </Flex>

        <Box
          as="main"
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
        >
          <SkipNavContent />
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Phone navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(details) => setDrawerOpen(details.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerHeader>
            <HStack gap="2">
              <BrandMark />
              <DrawerTitle fontWeight="bold" fontSize="lg">
                Lumen
              </DrawerTitle>
            </HStack>
          </DrawerHeader>
          <DrawerBody px="2">
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <Box p="4" borderTopWidth="1px">
            <UserBadge />
          </Box>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
