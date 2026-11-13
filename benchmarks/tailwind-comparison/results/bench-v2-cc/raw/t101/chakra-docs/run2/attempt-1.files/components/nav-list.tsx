"use client"

import { Box, Collapsible, Flex, Link, Separator, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { navGroups, type NavGroupData, type NavItemData } from "@/lib/nav"

interface NavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function NavItem({
  item,
  collapsed,
  onNavigate,
}: NavProps & { item: NavItemData }) {
  const pathname = usePathname()
  const active = pathname === item.href
  const Icon = item.icon
  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
    >
      <Link
        asChild
        display="flex"
        alignItems="center"
        gap="2"
        h="8"
        px={collapsed ? "0" : "2.5"}
        justifyContent={collapsed ? "center" : "flex-start"}
        rounded="l2"
        textStyle="sm"
        fontWeight="medium"
        textDecoration="none"
        bg={active ? "brand.solid" : "transparent"}
        color={active ? "brand.contrast" : "fg"}
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
          <Icon aria-hidden size={16} />
          {!collapsed && <span>{item.label}</span>}
        </NextLink>
      </Link>
    </Tooltip>
  )
}

function ItemList({
  group,
  collapsed,
  onNavigate,
}: NavProps & { group: NavGroupData }) {
  return (
    <ul
      aria-label={group.label}
      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}
    >
      {group.items.map((item) => (
        <li key={item.href}>
          <NavItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  )
}

function NavGroup({
  group,
  collapsed,
  onNavigate,
  first,
}: NavProps & { group: NavGroupData; first: boolean }) {
  if (collapsed) {
    return (
      <Box>
        {!first && <Separator my="2" />}
        <ItemList group={group} collapsed onNavigate={onNavigate} />
      </Box>
    )
  }
  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger
        display="flex"
        w="full"
        alignItems="center"
        justifyContent="space-between"
        h="7"
        px="2.5"
        mb="0.5"
        rounded="l2"
        cursor="pointer"
        color="fg.muted"
        textStyle="xs"
        fontWeight="semibold"
        letterSpacing="wider"
        textTransform="uppercase"
        _hover={{ color: "fg" }}
      >
        <Text as="span">{group.label}</Text>
        <LuChevronDown aria-hidden size={14} />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ItemList group={group} onNavigate={onNavigate} />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function NavList({ collapsed = false, onNavigate }: NavProps) {
  return (
    <Box as="nav" aria-label="Primary">
      <Stack gap={collapsed ? "0" : "3"}>
        {navGroups.map((group, i) => (
          <NavGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            onNavigate={onNavigate}
            first={i === 0}
          />
        ))}
      </Stack>
    </Box>
  )
}
