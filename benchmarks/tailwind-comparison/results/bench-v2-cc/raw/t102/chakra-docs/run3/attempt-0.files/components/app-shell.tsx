"use client"

import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LuMenu, LuPanelLeftClose, LuPanelLeftOpen, LuSparkles } from "react-icons/lu"
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
import { user } from "@/lib/data"
import { crumbsFor } from "./nav-config"
import { SidebarNav } from "./sidebar-nav"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      asChild
      variant="plain"
      textDecoration="none"
      color="fg"
      aria-label="Lumen home"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/">
        <HStack gap="3" minH="12" justifyContent={collapsed ? "center" : "flex-start"}>
          <Flex
            boxSize="10"
            align="center"
            justify="center"
            borderRadius="l2"
            bg="brand.solid"
            color="brand.contrast"
            flexShrink={0}
          >
            <LuSparkles size={20} aria-hidden="true" />
          </Flex>
          {!collapsed && (
            <Heading as="span" size="xl">
              Lumen
            </Heading>
          )}
        </HStack>
      </NextLink>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = crumbsFor(pathname)

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="4"
        top="4"
        zIndex="max"
        px="4"
        py="3"
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
        transform="translateY(-200%)"
        _focusVisible={{ transform: "translateY(0)" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        display={{ base: "none", lg: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "24" : "72"}
        transition="width 0.2s"
        bg="bg.panel"
        borderEndWidth="1px"
        borderColor="border"
        px={collapsed ? "4" : "5"}
        py="6"
        gap="8"
        overflowY="auto"
      >
        <Brand collapsed={collapsed} />
        <SidebarNav collapsed={collapsed} />
      </Flex>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          align="center"
          justify="space-between"
          gap="4"
          minH="20"
          px={{ base: "4", md: "8" }}
          bg="bg.panel"
          borderBottomWidth="1px"
          borderColor="border"
        >
          <HStack gap="3" minW="0">
            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              variant="outline"
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              onClick={() => setDrawerOpen(true)}
            >
              <LuMenu />
            </IconButton>
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              positioning={{ placement: "bottom" }}
            >
              <IconButton
                display={{ base: "none", lg: "inline-flex" }}
                variant="ghost"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
            <BreadcrumbRoot size="lg" separatorGap="3">
              {crumbs.map((crumb, i) =>
                i === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={crumb.label} fontWeight="semibold">
                    {crumb.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Text as="span" key={crumb.label} color="fg.muted">
                    {crumb.label}
                  </Text>
                ),
              )}
            </BreadcrumbRoot>
          </HStack>

          <HStack gap="3" flexShrink={0}>
            <ColorModeButton size="md" />
            <HStack gap="3">
              <Avatar name={user.name} size="md" colorPalette="brand" />
              <Box display={{ base: "none", md: "block" }} lineHeight="short">
                <Text fontWeight="semibold">{user.name}</Text>
                <Text fontSize="sm" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8", xl: "12" }}
          py={{ base: "8", md: "12" }}
          _focusVisible={{ outline: "none" }}
        >
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      {/* Mobile navigation drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle asChild>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody pt="4" pb="8">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
