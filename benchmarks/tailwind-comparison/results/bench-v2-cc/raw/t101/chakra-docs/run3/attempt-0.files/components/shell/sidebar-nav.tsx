"use client"

import { Tooltip } from "@/components/ui/tooltip"
import { type NavItem, isActive, navGroups } from "@/lib/nav"
import { Collapsible, chakra } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LuChevronDown } from "react-icons/lu"

export const NavLink = chakra(NextLink)

interface NavItemLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

function NavItemLink({ item, active, collapsed, onNavigate }: NavItemLinkProps) {
  const Icon = item.icon
  const link = (
    <NavLink
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      onClick={onNavigate}
      display="flex"
      alignItems="center"
      justifyContent={collapsed ? "center" : "flex-start"}
      gap="2.5"
      h="8"
      px="2"
      fontSize="sm"
      fontWeight={active ? "semibold" : "medium"}
      borderRadius="l2"
      borderStartWidth="2px"
      borderStartColor={active ? "brand.solid" : "transparent"}
      bg={active ? "brand.muted" : "transparent"}
      color={active ? "brand.fg" : "fg.muted"}
      textDecoration="none"
      _hover={{
        bg: active ? "brand.muted" : "bg.muted",
        color: active ? "brand.fg" : "fg",
      }}
      focusVisibleRing="outside"
    >
      <Icon aria-hidden size={16} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )

  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      openDelay={200}
      disabled={!collapsed}
    >
      {link}
    </Tooltip>
  )
}

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const [closed, setClosed] = useState<Record<string, boolean>>({})

  return (
    <chakra.nav aria-label="Main navigation">
      <chakra.ul
        listStyle="none"
        m="0"
        p="0"
        display="flex"
        flexDirection="column"
        gap={collapsed ? "2" : "3"}
      >
        {navGroups.map((group, index) => {
          const items = (
            <chakra.ul
              aria-label={group.label}
              listStyle="none"
              m="0"
              p="0"
              display="flex"
              flexDirection="column"
              gap="0.5"
            >
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItemLink
                    item={item}
                    active={isActive(item.href, pathname)}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </chakra.ul>
          )

          return (
            <li key={group.id}>
              {collapsed ? (
                <chakra.div
                  borderTopWidth={index > 0 ? "1px" : "0"}
                  pt={index > 0 ? "2" : "0"}
                >
                  {items}
                </chakra.div>
              ) : (
                <Collapsible.Root
                  open={!closed[group.id]}
                  onOpenChange={(e) =>
                    setClosed((prev) => ({ ...prev, [group.id]: !e.open }))
                  }
                >
                  <Collapsible.Trigger
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    w="100%"
                    h="6"
                    px="2"
                    mb="0.5"
                    fontSize="xs"
                    fontWeight="semibold"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    color="fg.muted"
                    borderRadius="l2"
                    cursor="pointer"
                    _hover={{ color: "fg" }}
                    focusVisibleRing="outside"
                  >
                    {group.label}
                    <Collapsible.Indicator
                      display="inline-flex"
                      transition="transform 0.15s"
                      _open={{ transform: "rotate(180deg)" }}
                    >
                      <LuChevronDown aria-hidden size={14} />
                    </Collapsible.Indicator>
                  </Collapsible.Trigger>
                  <Collapsible.Content>{items}</Collapsible.Content>
                </Collapsible.Root>
              )}
            </li>
          )
        })}
      </chakra.ul>
    </chakra.nav>
  )
}
