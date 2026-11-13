"use client"

import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
} from "react-icons/lu"
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
  MenuTrigger,
} from "@/components/ui/menu"
import { toaster } from "@/components/ui/toaster"
import { user } from "@/lib/data"
import { findCurrent } from "./nav-config"
import { NavList } from "./nav-list"

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"}>
      <Flex
        boxSize="11"
        align="center"
        justify="center"
        flexShrink={0}
        borderRadius="l2"
        bg="brand.solid"
        color="brand.contrast"
      >
        <Icon boxSize="6" aria-hidden>
          <LuSparkles />
        </Icon>
      </Flex>
      {!collapsed && (
        <Text
          fontFamily="heading"
          fontSize="2xl"
          fontWeight="bold"
          letterSpacing="tight"
        >
          Lumen
        </Text>
      )}
    </HStack>
  )
}

function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname()
  const current = findCurrent(pathname)

  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      align="center"
      gap="4"
      minH="20"
      px={{ base: "4", md: "10" }}
      bg="bg/85"
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor="border"
    >
      <IconButton
        display={{ base: "inline-flex", md: "none" }}
        variant="outline"
        size="lg"
        aria-label="Open navigation menu"
        onClick={onOpenMenu}
      >
        <LuMenu />
      </IconButton>

      <BreadcrumbRoot size="lg" separatorGap="3">
        <BreadcrumbLink asChild>
          <NextLink href="/">Lumen</NextLink>
        </BreadcrumbLink>
        {current ? (
          <Text as="span" color="fg.muted">
            {current.group.label}
          </Text>
        ) : (
          <Text as="span" color="fg.muted">
            Page
          </Text>
        )}
        <BreadcrumbCurrentLink>
          {current ? current.item.label : "Not found"}
        </BreadcrumbCurrentLink>
      </BreadcrumbRoot>

      <HStack ml="auto" gap="2">
        <ColorModeButton size="lg" />
        <MenuRoot positioning={{ placement: "bottom-end" }}>
          <MenuTrigger asChild>
            <IconButton
              variant="ghost"
              size="lg"
              rounded="full"
              aria-label={`Account menu for ${user.name}`}
            >
              <Avatar name={user.name} size="sm" colorPalette="brand" />
            </IconButton>
          </MenuTrigger>
          <MenuContent minW="56" p="2">
            <Box px="3" py="2">
              <Text fontWeight="semibold">{user.name}</Text>
              <Text fontSize="sm" color="fg.muted">
                {user.email}
              </Text>
            </Box>
            <MenuItem value="settings" asChild minH="11" px="3">
              <NextLink href="/settings">Settings</NextLink>
            </MenuItem>
            <MenuItem
              value="sign-out"
              minH="11"
              px="3"
              onClick={() =>
                toaster.create({
                  title: "Sign-out is off in this demo workspace",
                  type: "info",
                })
              }
            >
              Sign out
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </HStack>
    </Flex>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Close the phone drawer after navigating.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <Link
        href="#main-content"
        position="absolute"
        left="4"
        top="-20"
        zIndex="max"
        px="4"
        py="3"
        borderRadius="l2"
        bg="bg.panel"
        _focus={{ top: "4" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "24" : "80"}
        px="4"
        py="6"
        gap="8"
        bg="bg.panel"
        borderRightWidth="1px"
        borderColor="border"
        transition="width 0.2s ease"
      >
        <Box px={collapsed ? "0" : "2"}>
          <Brand collapsed={collapsed} />
        </Box>
        <Box flex="1" overflowY="auto" overflowX="hidden">
          <NavList collapsed={collapsed} />
        </Box>
        <IconButton
          variant="ghost"
          size="lg"
          alignSelf={collapsed ? "center" : "flex-end"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
        </IconButton>
      </Flex>

      {/* Phone drawer */}
      <DrawerRoot
        placement="start"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent maxW="80" w="calc(100vw - 3rem)">
          <DrawerHeader pt="6" pb="2">
            <DrawerTitle asChild>
              <Brand />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody py="6">
            <NavList />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Header onOpenMenu={() => setDrawerOpen(true)} />
        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          w="full"
          maxW="6xl"
          mx="auto"
          px={{ base: "4", md: "10" }}
          py={{ base: "8", md: "12" }}
          outline="none"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
