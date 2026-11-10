"use client"

import { Box, chakra, Collapsible, Icon, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { isActive, type NavGroup, type NavItem, navGroups } from "./nav-config"

const NavLink = chakra(NextLink)

function NavItemLink({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  return (
    <Box as="li" listStyleType="none">
      <Tooltip
        content={item.label}
        positioning={{ placement: "right" }}
        disabled={!collapsed}
        showArrow
      >
        <NavLink
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          display="flex"
          alignItems="center"
          justifyContent={collapsed ? "center" : "flex-start"}
          gap="3"
          minH="12"
          px={collapsed ? "0" : "4"}
          borderRadius="l2"
          fontWeight="medium"
          textDecoration="none"
          bg={active ? "brand.solid" : "transparent"}
          color={active ? "brand.contrast" : "fg"}
          _hover={{
            bg: active ? "brand.solid" : "bg.muted",
            textDecoration: "none",
          }}
          focusVisibleRing="outside"
        >
          <Icon boxSize="5" flexShrink={0}>
            <item.icon />
          </Icon>
          {!collapsed && <Text truncate>{item.label}</Text>}
        </NavLink>
      </Tooltip>
    </Box>
  )
}

function ItemList({
  group,
  collapsed,
  pathname,
}: {
  group: NavGroup
  collapsed: boolean
  pathname: string
}) {
  return (
    <Stack as="ul" gap="1" m="0" p="0" listStyleType="none">
      {group.items.map((item) => (
        <NavItemLink
          key={item.href}
          item={item}
          collapsed={collapsed}
          active={isActive(pathname, item.href)}
        />
      ))}
    </Stack>
  )
}

export function NavList({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()

  return (
    <Box as="nav" aria-label="Main navigation">
      <Stack gap={collapsed ? "5" : "4"}>
        {navGroups.map((group) =>
          collapsed ? (
            <ItemList
              key={group.label}
              group={group}
              collapsed
              pathname={pathname}
            />
          ) : (
            <Collapsible.Root key={group.label} defaultOpen>
              <Collapsible.Trigger
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                w="full"
                minH="10"
                px="4"
                mb="1"
                borderRadius="l2"
                cursor="pointer"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wider"
                textTransform="uppercase"
                color="fg.muted"
                focusVisibleRing="outside"
                _open={{ "& svg": { transform: "rotate(180deg)" } }}
              >
                {group.label}
                <Icon boxSize="4" transition="transform 0.2s">
                  <LuChevronDown />
                </Icon>
              </Collapsible.Trigger>
              <Collapsible.Content>
                <ItemList group={group} collapsed={false} pathname={pathname} />
              </Collapsible.Content>
            </Collapsible.Root>
          ),
        )}
      </Stack>
    </Box>
  )
}
