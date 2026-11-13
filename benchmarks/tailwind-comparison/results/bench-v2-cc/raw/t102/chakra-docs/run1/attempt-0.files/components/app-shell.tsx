"use client"

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Link,
  Spacer,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronsLeft,
  LuChevronsRight,
  LuMenu,
  LuSparkles,
} from "react-icons/lu"
import { NavList } from "@/components/nav-list"
import { Avatar } from "@/components/ui/avatar"
import { BreadcrumbCurrentLink, BreadcrumbRoot } from "@/components/ui/breadcrumb"
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
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import { crumbsFor } from "@/lib/nav"

function BrandMark({ showName = true }: { showName?: boolean }) {
  return (
    <Link
      asChild
      colorPalette="brand"
      display="flex"
      alignItems="center"
      gap="3"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <Flex
          boxSize="11"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="l2"
          bg="colorPalette.solid"
          color="colorPalette.contrast"
        >
          <Icon boxSize="6">
            <LuSparkles />
          </Icon>
        </Flex>
        {showName && (
          <Text
            fontFamily="heading"
            fontWeight="bold"
            fontSize="2xl"
            color="fg"
            letterSpacing="tight"
          >
            Lumen
          </Text>
        )}
      </NextLink>
    </Link>
  )
}

function UserMenu() {
  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button
          variant="ghost"
          colorPalette="gray"
          h="auto"
          py="2"
          px="2"
          gap="3"
          aria-label={`Account menu for ${user.name}`}
        >
          <Avatar size="sm" name={user.name} colorPalette="brand" />
          <Box hideBelow="md" textAlign="start">
            <Text fontWeight="semibold" lineHeight="short">
              {user.name}
            </Text>
            <Text textStyle="xs" color="fg.muted" lineHeight="short">
              {user.role}
            </Text>
          </Box>
        </Button>
      </MenuTrigger>
      <MenuContent minW="64">
        <Box px="3" py="2">
          <Text fontWeight="semibold">{user.name}</Text>
          <Text textStyle="sm" color="fg.muted">
            {user.email}
          </Text>
        </Box>
        <MenuSeparator />
        <MenuItem value="settings" asChild minH="11">
          <NextLink href="/settings">Settings</NextLink>
        </MenuItem>
        <MenuItem
          value="sign-out"
          minH="11"
          onClick={() =>
            toaster.create({
              title: "Demo workspace",
              description: "Signing out is turned off in this preview.",
              type: "info",
            })
          }
        >
          Sign out
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const isDesktop = useBreakpointValue({ base: false, md: true })
  const crumbs = crumbsFor(pathname)

  React.useEffect(() => {
    if (isDesktop) setDrawerOpen(false)
  }, [isDesktop])

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar"

  return (
    <Flex minH="100dvh" colorPalette="brand" bg="bg">
      <Link
        href="#main"
        position="absolute"
        zIndex="skipLink"
        insetStart="4"
        top="4"
        px="5"
        py="3"
        borderRadius="l2"
        bg="colorPalette.solid"
        color="colorPalette.contrast"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Box asChild>
        <aside aria-label="Sidebar">
          <Flex
            display={{ base: "none", md: "flex" }}
            direction="column"
            position="sticky"
            top="0"
            alignSelf="flex-start"
            h="100dvh"
            flexShrink={0}
            w={collapsed ? "24" : "72"}
            px="4"
            py="5"
            gap="8"
            bg="bg.panel"
            borderEndWidth="1px"
            borderColor="border"
            transition="width 0.2s ease"
            overflowY="auto"
          >
            <Flex justify={collapsed ? "center" : "flex-start"} px={collapsed ? "0" : "2"}>
              <BrandMark showName={!collapsed} />
            </Flex>
            <Box flex="1">
              <NavList collapsed={collapsed} />
            </Box>
            <Tooltip
              content={toggleLabel}
              disabled={!collapsed}
              showArrow
              positioning={{ placement: "right" }}
            >
              <Button
                variant="ghost"
                colorPalette="gray"
                justifyContent={collapsed ? "center" : "flex-start"}
                w={collapsed ? "12" : "full"}
                mx={collapsed ? "auto" : "0"}
                px={collapsed ? "0" : "4"}
                aria-label={toggleLabel}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
                {!collapsed && "Collapse"}
              </Button>
            </Tooltip>
          </Flex>
        </aside>
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Box asChild>
          <header>
            <Flex
              position="sticky"
              top="0"
              zIndex="sticky"
              align="center"
              gap="3"
              minH="20"
              px={{ base: "4", md: "8" }}
              bg="bg/85"
              backdropFilter="blur(12px)"
              borderBottomWidth="1px"
              borderColor="border"
            >
              <IconButton
                hideFrom="md"
                variant="outline"
                colorPalette="gray"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <LuMenu />
              </IconButton>
              <BreadcrumbRoot size="lg">
                <Text as="span" color="fg.muted">
                  {crumbs.group}
                </Text>
                <BreadcrumbCurrentLink>{crumbs.page}</BreadcrumbCurrentLink>
              </BreadcrumbRoot>
              <Spacer />
              <ColorModeButton colorPalette="gray" />
              <UserMenu />
            </Flex>
          </header>
        </Box>

        <Box asChild flex="1">
          <main id="main" tabIndex={-1}>
            <Box
              w="full"
              maxW="6xl"
              mx="auto"
              px={{ base: "4", md: "8" }}
              py={{ base: "8", md: "12" }}
              outline="none"
            >
              {children}
            </Box>
          </main>
        </Box>
      </Flex>

      {/* Phone navigation drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader pt="6">
            <DrawerTitle asChild>
              <div>
                <BrandMark />
              </div>
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody pt="4">
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
