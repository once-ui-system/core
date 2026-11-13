"use client"

import {
  Box,
  Flex,
  HStack,
  IconButton,
  chakra,
  Link,
  Separator,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import {
  LuChevronDown,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
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
import { Tooltip } from "@/components/ui/tooltip"
import { user } from "@/lib/data"
import {
  type NavGroup,
  type NavItem,
  findCurrent,
  isActive,
  navGroups,
} from "./nav-config"

function Brand({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  return (
    <Link
      asChild
      display="flex"
      alignItems="center"
      gap="3"
      color="fg"
      justifyContent={collapsed ? "center" : "flex-start"}
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home" onClick={onNavigate}>
        <Flex
          boxSize="8"
          flexShrink="0"
          align="center"
          justify="center"
          rounded="l2"
          bg="brand.solid"
          color="brand.contrast"
          fontFamily="heading"
          fontWeight="bold"
          aria-hidden="true"
        >
          L
        </Flex>
        {!collapsed && (
          <Text
            as="span"
            fontFamily="heading"
            fontWeight="semibold"
            letterSpacing="0.12em"
            fontSize="sm"
          >
            LUMEN
          </Text>
        )}
      </NextLink>
    </Link>
  )
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
      gap="3"
      px="3"
      py="2"
      rounded="l2"
      fontSize="sm"
      fontWeight="medium"
      justifyContent={collapsed ? "center" : "flex-start"}
      color={active ? "brand.fg" : "fg.muted"}
      bg={active ? "brand.muted" : "transparent"}
      borderStartWidth="2px"
      borderStartColor={active ? "brand.solid" : "transparent"}
      _hover={{
        textDecoration: "none",
        bg: active ? "brand.muted" : "bg.muted",
        color: active ? "brand.fg" : "fg",
      }}
    >
      <NextLink
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        onClick={onNavigate}
      >
        <Icon size={18} aria-hidden="true" />
        {!collapsed && <span>{item.label}</span>}
      </NextLink>
    </Link>
  )

  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      disabled={!collapsed}
    >
      {link}
    </Tooltip>
  )
}

function NavGroupSection({
  group,
  pathname,
  collapsed,
  onNavigate,
}: {
  group: NavGroup
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const [open, setOpen] = React.useState(true)
  const listId = `nav-group-${group.id}`
  const expanded = collapsed || open

  return (
    <Box as="li" listStyleType="none">
      {collapsed ? (
        <Separator my="3" />
      ) : (
        <chakra.button
          type="button"
          display="flex"
          alignItems="center"
          w="full"
          justifyContent="space-between"
          px="3"
          py="1.5"
          mb="1"
          rounded="l2"
          color="fg.subtle"
          fontFamily="heading"
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="0.1em"
          textTransform="uppercase"
          cursor="pointer"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          _hover={{ color: "fg" }}
          focusVisibleRing="outside"
        >
          <span>{group.label}</span>
          <Box
            as="span"
            display="inline-flex"
            transition="transform 0.15s"
            transform={open ? "rotate(0deg)" : "rotate(-90deg)"}
          >
            <LuChevronDown size={14} aria-hidden="true" />
          </Box>
        </chakra.button>
      )}
      <Box id={listId} hidden={!expanded}>
        <Box
          as="ul"
          m="0"
          p="0"
          listStyleType="none"
          display="flex"
          flexDirection="column"
          gap="1"
          aria-label={collapsed ? group.label : undefined}
        >
          {group.items.map((item) => (
            <li key={item.href}>
              <NavItemLink
                item={item}
                active={isActive(pathname, item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

function SidebarNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <Box as="nav" aria-label="Primary" px="3" py="2" flex="1" overflowY="auto">
      <Box
        as="ul"
        m="0"
        p="0"
        listStyleType="none"
        display="flex"
        flexDirection="column"
        gap="2"
      >
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.id}
            group={group}
            pathname={pathname}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </Box>
    </Box>
  )
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack
      gap="3"
      p="3"
      borderTopWidth="1px"
      justify={collapsed ? "center" : "flex-start"}
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role} · {user.email}
          </Text>
        </Box>
      )}
    </HStack>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const current = findCurrent(pathname)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <Flex minH="100dvh" bg="bg" color="fg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="toast"
        px="3"
        py="2"
        rounded="l2"
        bg="brand.solid"
        color="brand.contrast"
        transform="translateY(-250%)"
        _focus={{ transform: "translateY(0)" }}
      >
        Skip to content
      </Link>

      <Box
        as="aside"
        id="sidebar"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        flexShrink="0"
        position="sticky"
        top="0"
        h="100dvh"
        w={collapsed ? "64px" : "264px"}
        bg="bg.subtle"
        borderEndWidth="1px"
        transition="width 0.15s ease"
      >
        <Flex h="14" align="center" px="3" borderBottomWidth="1px">
          <Brand collapsed={collapsed} />
        </Flex>
        <SidebarNav pathname={pathname} collapsed={collapsed} />
        <UserBlock collapsed={collapsed} />
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          align="center"
          gap="3"
          px={{ base: "4", md: "6" }}
          bg="bg"
          borderBottomWidth="1px"
        >
          <IconButton
            variant="ghost"
            colorPalette="gray"
            size="sm"
            display={{ base: "inline-flex", md: "none" }}
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            variant="ghost"
            colorPalette="gray"
            size="sm"
            display={{ base: "none", md: "inline-flex" }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <Box flex="1" minW="0">
            {current && (
              <BreadcrumbRoot>
                <Text as="span" color="fg.muted">
                  {current.group.label}
                </Text>
                <BreadcrumbCurrentLink>{current.item.label}</BreadcrumbCurrentLink>
              </BreadcrumbRoot>
            )}
          </Box>

          <ColorModeButton />
          <Avatar
            name={user.name}
            size="xs"
            display={{ base: "none", sm: "inline-flex" }}
          />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "6", md: "8" }}
          outline="none"
        >
          <Box maxW="1200px" mx="auto" w="full">
            {children}
          </Box>
        </Box>
      </Flex>

      <DrawerRoot
        open={mobileOpen}
        onOpenChange={(e) => setMobileOpen(e.open)}
        placement="start"
        size="xs"
      >
        <DrawerContent bg="bg.subtle">
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle fontFamily="heading" letterSpacing="0.1em">
              LUMEN
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="0" display="flex" flexDirection="column">
            <SidebarNav
              pathname={pathname}
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
            <UserBlock collapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Flex>
  )
}
