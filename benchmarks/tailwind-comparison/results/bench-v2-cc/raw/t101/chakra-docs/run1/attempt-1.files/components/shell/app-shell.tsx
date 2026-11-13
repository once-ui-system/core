"use client"

import { useState } from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Collapsible,
  Flex,
  Heading,
  IconButton,
  Link,
  Separator,
  SkipNavContent,
  SkipNavLink,
  Text,
} from "@chakra-ui/react"
import type { IconType } from "react-icons"
import {
  LuChevronDown,
  LuFileText,
  LuFolder,
  LuLayoutDashboard,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSettings,
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
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"

interface NavItem {
  label: string
  href: string
  icon: IconType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Analytics",
    items: [
      { label: "Overview", href: "/", icon: LuLayoutDashboard },
      { label: "Reports", href: "/reports", icon: LuFileText },
    ],
  },
  {
    label: "Workspace",
    items: [
      { label: "Projects", href: "/projects", icon: LuFolder },
      { label: "Settings", href: "/settings", icon: LuSettings },
    ],
  },
]

function crumbsFor(pathname: string): { group: string; label: string } {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === pathname) return { group: group.label, label: item.label }
    }
  }
  return { group: "Analytics", label: "Overview" }
}

function NavItemLink({
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
    <Link
      asChild
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? "center" : "flex-start"}
      gap="2"
      h="7"
      px="2"
      rounded="l2"
      textStyle="sm"
      fontWeight={active ? "medium" : "normal"}
      textDecoration="none"
      color={active ? "brand.contrast" : "fg"}
      bg={active ? "brand.solid" : "transparent"}
      _hover={{
        textDecoration: "none",
        bg: active ? "brand.solid" : "bg.muted",
      }}
    >
      <NextLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        onClick={onNavigate}
      >
        <Icon size={16} aria-hidden="true" style={{ flexShrink: 0 }} />
        {!collapsed && <span>{item.label}</span>}
      </NextLink>
    </Link>
  )

  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
    >
      {link}
    </Tooltip>
  )
}

function NavList({
  label,
  collapsed,
  pathname,
  onNavigate,
}: {
  label: string
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <Box as="nav" aria-label={label}>
      {navGroups.map((group, index) =>
        collapsed ? (
          <Box key={group.label} role="group" aria-label={group.label}>
            {index > 0 && <Separator my="2" />}
            <Flex direction="column" gap="0.5">
              {group.items.map((item) => (
                <NavItemLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed
                  onNavigate={onNavigate}
                />
              ))}
            </Flex>
          </Box>
        ) : (
          <Collapsible.Root key={group.label} defaultOpen mb="2">
            <Collapsible.Trigger
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              w="full"
              h="6"
              px="2"
              rounded="l2"
              cursor="pointer"
              color="fg.muted"
              textStyle="xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="0.06em"
              _hover={{ color: "fg" }}
            >
              {group.label}
              <Box
                as="span"
                display="inline-flex"
                css={{
                  transition: "transform 0.15s",
                  "[data-state=open] > &": { transform: "rotate(180deg)" },
                }}
              >
                <LuChevronDown size={14} aria-hidden="true" />
              </Box>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <Flex direction="column" gap="0.5" mt="1">
                {group.items.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    collapsed={false}
                    onNavigate={onNavigate}
                  />
                ))}
              </Flex>
            </Collapsible.Content>
          </Collapsible.Root>
        ),
      )}
    </Box>
  )
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="2"
      h="11"
      px={collapsed ? "0" : "3"}
    >
      <Flex
        align="center"
        justify="center"
        boxSize="6"
        rounded="l2"
        bg="brand.solid"
        color="brand.contrast"
        fontFamily="heading"
        fontWeight="bold"
        aria-hidden="true"
        flexShrink={0}
      >
        L
      </Flex>
      {!collapsed && (
        <Heading as="p" size="lg" fontWeight="semibold">
          Lumen
        </Heading>
      )}
    </Flex>
  )
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  return (
    <Flex
      align="center"
      justify={collapsed ? "center" : "flex-start"}
      gap="2"
      p="2"
      borderTopWidth="1px"
    >
      <Avatar name={user.name} size="xs" colorPalette="brand" />
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
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const crumbs = crumbsFor(pathname)

  return (
    <Flex minH="100dvh" bg="bg" color="fg" colorPalette="brand">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "52px" : "224px"}
        borderEndWidth="1px"
        bg="bg.subtle"
        css={{ transition: "width 0.15s ease" }}
      >
        <Brand collapsed={collapsed} />
        <Box flex="1" overflowY="auto" px="2" py="2">
          <NavList
            label="Primary"
            collapsed={collapsed}
            pathname={pathname}
          />
        </Box>
        <UserBlock collapsed={collapsed} />
      </Box>

      {/* Phone drawer */}
      <DrawerRoot
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader>
            <DrawerTitle fontFamily="heading">Lumen</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <NavList
              label="Mobile"
              collapsed={false}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          align="center"
          gap="2"
          h="11"
          px={{ base: "3", md: "4" }}
          borderBottomWidth="1px"
          bg="bg"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <IconButton
            variant="ghost"
            size="sm"
            display={{ base: "inline-flex", md: "none" }}
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            display={{ base: "none", md: "inline-flex" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <Box minW="0" flex="1">
            <BreadcrumbRoot size="sm" separatorGap="1.5">
              <BreadcrumbLink asChild>
                <NextLink href="/">Lumen</NextLink>
              </BreadcrumbLink>
              <span>{crumbs.group}</span>
              <BreadcrumbCurrentLink>{crumbs.label}</BreadcrumbCurrentLink>
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
        </Flex>

        <SkipNavContent />
        <Box
          as="main"
          flex="1"
          minW="0"
          px={{ base: "3", md: "5" }}
          py={{ base: "4", md: "5" }}
          maxW="6xl"
          w="full"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
