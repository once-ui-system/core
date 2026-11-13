"use client"

import { Box, Collapsible, HStack, Link, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { LuChevronDown } from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { isCurrent, navGroups, type NavItem } from "./nav-config"

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const current = isCurrent(item, pathname)
  const Icon = item.icon

  return (
    <Tooltip
      content={item.label}
      disabled={!collapsed}
      positioning={{ placement: "right" }}
      showArrow
    >
      <Link
        asChild
        variant="plain"
        aria-label={item.label}
        aria-current={current ? "page" : undefined}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? "center" : "flex-start"}
        gap="3"
        minH="12"
        px={collapsed ? "0" : "4"}
        borderRadius="l2"
        fontWeight="semibold"
        textDecoration="none"
        bg={current ? "brand.solid" : "transparent"}
        color={current ? "brand.contrast" : "fg"}
        _hover={{
          textDecoration: "none",
          bg: current ? "brand.solid" : "brand.muted",
          color: current ? "brand.contrast" : "brand.fg",
        }}
      >
        <NextLink href={item.href} onClick={onNavigate}>
          <Icon size={20} aria-hidden="true" />
          {!collapsed && <Text as="span">{item.label}</Text>}
        </NextLink>
      </Link>
    </Tooltip>
  )
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  return (
    <Box as="nav" aria-label="Main">
      <Stack as="ul" gap={collapsed ? "6" : "5"} listStyle="none" m="0" p="0">
        {navGroups.map((group) => (
          <Box as="li" key={group.label}>
            {collapsed ? (
              <Stack as="ul" gap="2" listStyle="none" m="0" p="0" aria-label={group.label}>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavLink item={item} collapsed onNavigate={onNavigate} />
                  </li>
                ))}
              </Stack>
            ) : (
              <Collapsible.Root defaultOpen>
                <Collapsible.Trigger
                  width="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  minH="10"
                  px="4"
                  borderRadius="l2"
                  cursor="pointer"
                  color="fg.muted"
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textTransform="uppercase"
                  _hover={{ color: "brand.fg" }}
                  css={{
                    "&[data-state=open] .chevron": { transform: "rotate(0deg)" },
                    "&[data-state=closed] .chevron": { transform: "rotate(-90deg)" },
                  }}
                >
                  <HStack gap="2">
                    <span>{group.label}</span>
                  </HStack>
                  <Box className="chevron" transition="transform 0.2s" display="inline-flex">
                    <LuChevronDown aria-hidden="true" />
                  </Box>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <Stack as="ul" gap="2" listStyle="none" m="0" p="0" pt="2">
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <NavLink
                          item={item}
                          collapsed={false}
                          onNavigate={onNavigate}
                        />
                      </li>
                    ))}
                  </Stack>
                </Collapsible.Content>
              </Collapsible.Root>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
