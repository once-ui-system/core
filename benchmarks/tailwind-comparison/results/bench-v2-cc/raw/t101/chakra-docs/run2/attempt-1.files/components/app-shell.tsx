"use client"

import { Box, Flex, IconButton, Link, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
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
import { user } from "@/lib/data"
import { findNav } from "@/lib/nav"

function Brand({ showName = true }: { showName?: boolean }) {
  return (
    <Link
      asChild
      display="flex"
      alignItems="center"
      gap="2"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <Flex
          boxSize="6"
          align="center"
          justify="center"
          rounded="l2"
          bg="brand.solid"
          color="brand.contrast"
          fontFamily="heading"
          fontWeight="bold"
          textStyle="sm"
          aria-hidden
        >
          L
        </Flex>
        {showName && (
          <Text as="span" fontFamily="heading" fontWeight="semibold" textStyle="lg" color="fg">
            Lumen
          </Text>
        )}
      </NextLink>
    </Link>
  )
}

function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      as="aside"
      hideBelow="md"
      direction="column"
      flexShrink={0}
      w={collapsed ? "14" : "60"}
      transition="width 0.15s ease"
      position="sticky"
      top="0"
      h="100dvh"
      bg="bg.subtle"
      borderEndWidth="1px"
      aria-label="Sidebar"
    >
      <Flex h="12" align="center" px={collapsed ? "0" : "4"} justify={collapsed ? "center" : "flex-start"} borderBottomWidth="1px">
        <Brand showName={!collapsed} />
      </Flex>
      <Box flex="1" overflowY="auto" overflowX="hidden" p="2">
        <NavList collapsed={collapsed} />
      </Box>
      <Flex
        align="center"
        gap="2"
        p="2"
        borderTopWidth="1px"
        justify={collapsed ? "center" : "flex-start"}
      >
        <Avatar name={user.name} size="xs" />
        {!collapsed && (
          <Box minW="0">
            <Text textStyle="sm" fontWeight="medium" truncate>
              {user.name}
            </Text>
            <Text textStyle="xs" color="fg.muted" truncate>
              {user.role}
            </Text>
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const current = findNav(pathname)

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="max"
        px="3"
        py="1.5"
        bg="bg"
        color="fg"
        rounded="l2"
        borderWidth="1px"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      <Sidebar collapsed={collapsed} />

      <DrawerRoot
        placement="start"
        size="xs"
        open={menuOpen}
        onOpenChange={(e) => setMenuOpen(e.open)}
      >
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" py="3">
            <DrawerTitle>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="2">
            <NavList onNavigate={() => setMenuOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="12"
          px={{ base: "3", md: "4" }}
          align="center"
          gap="2"
          bg="bg"
          borderBottomWidth="1px"
        >
          <IconButton
            hideFrom="md"
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            hideBelow="md"
            variant="ghost"
            size="sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>
          <BreadcrumbRoot size="sm" separator="/" separatorGap="1.5">
            <Text as="span" color="fg.muted">
              {current.group}
            </Text>
            <BreadcrumbCurrentLink>{current.label}</BreadcrumbCurrentLink>
          </BreadcrumbRoot>
          <Box flex="1" />
          <ColorModeButton />
          <Avatar name={user.name} size="xs" />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="1100px"
          p={{ base: "4", md: "6" }}
          _focus={{ outline: "none" }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
