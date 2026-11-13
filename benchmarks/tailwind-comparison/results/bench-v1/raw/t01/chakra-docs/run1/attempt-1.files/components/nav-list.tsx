"use client"

import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useState } from "react"
import {
  LuChevronDown,
  LuFileText,
  LuFolderKanban,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu"
import { Tooltip } from "@/components/ui/tooltip"
import { type NavGroup, type NavIconName, navGroups } from "@/lib/data"

const icons: Record<NavIconName, ReactNode> = {
  overview: <LuLayoutDashboard />,
  reports: <LuFileText />,
  projects: <LuFolderKanban />,
  settings: <LuSettings />,
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface NavListProps {
  /** Icon-only presentation (desktop collapsed sidebar). */
  collapsed?: boolean
  /** Called after a link is chosen, e.g. to close the mobile drawer. */
  onNavigate?: () => void
}

interface NavGroupSectionProps extends NavListProps {
  group: NavGroup
  pathname: string
}

function NavGroupSection({
  group,
  pathname,
  collapsed = false,
  onNavigate,
}: NavGroupSectionProps) {
  const [open, setOpen] = useState(true)
  const listId = `nav-group-${group.label.toLowerCase()}`
  const showItems = collapsed || open

  const list = (
    <Box
      as="ul"
      id={listId}
      listStyleType="none"
      m="0"
      p="0"
      display="flex"
      flexDirection="column"
      gap="0.5"
    >
      {group.items.map((item) => {
        const active = !!item.href && isActive(pathname, item.href)

        const content = (
          <>
            <Icon boxSize="5" flexShrink="0" aria-hidden="true">
              {icons[item.icon]}
            </Icon>
            {collapsed ? (
              <Box srOnly>{item.label}</Box>
            ) : (
              <>
                <Text as="span" flex="1" truncate>
                  {item.label}
                </Text>
                {!item.href && (
                  <Text as="span" fontSize="xs" color="fg.subtle">
                    Soon
                  </Text>
                )}
              </>
            )}
          </>
        )

        return (
          <li key={item.label}>
            <Tooltip
              content={item.label}
              positioning={{ placement: "right" }}
              disabled={!collapsed}
              showArrow
            >
              {item.href ? (
                <Flex
                  asChild
                  align="center"
                  gap="3"
                  px={collapsed ? "0" : "3"}
                  justify={collapsed ? "center" : "flex-start"}
                  h="10"
                  rounded="md"
                  fontSize="sm"
                  fontWeight={active ? "semibold" : "medium"}
                  colorPalette="blue"
                  bg={active ? "colorPalette.subtle" : "transparent"}
                  color={active ? "colorPalette.fg" : "fg.muted"}
                  _hover={{
                    bg: active ? "colorPalette.subtle" : "bg.muted",
                    color: active ? "colorPalette.fg" : "fg",
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                  >
                    {content}
                  </Link>
                </Flex>
              ) : (
                <Flex
                  align="center"
                  gap="3"
                  px={collapsed ? "0" : "3"}
                  justify={collapsed ? "center" : "flex-start"}
                  h="10"
                  rounded="md"
                  fontSize="sm"
                  fontWeight="medium"
                  tabIndex={0}
                  role="link"
                  aria-disabled="true"
                  color="fg.subtle"
                  cursor="not-allowed"
                >
                  {content}
                </Flex>
              )}
            </Tooltip>
          </li>
        )
      })}
    </Box>
  )

  if (collapsed) {
    return (
      <Box role="group" aria-label={group.label}>
        <Box h="px" bg="border.muted" mx="2" mb="2" aria-hidden="true" />
        {list}
      </Box>
    )
  }

  return (
    <Box>
      <Flex
        asChild
        w="full"
        align="center"
        justify="space-between"
        px="3"
        py="1.5"
        mb="1"
        rounded="md"
        cursor="pointer"
        color="fg.muted"
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        _hover={{ color: "fg" }}
      >
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
        >
          {group.label}
          <Icon
            boxSize="4"
            transition="transform 0.15s"
            transform={open ? "rotate(0deg)" : "rotate(-90deg)"}
            aria-hidden="true"
          >
            <LuChevronDown />
          </Icon>
        </button>
      </Flex>
      {showItems ? list : null}
    </Box>
  )
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname()

  return (
    <Box as="nav" aria-label="Main" w="full">
      <Box
        as="ul"
        listStyleType="none"
        m="0"
        p="0"
        display="flex"
        flexDirection="column"
        gap="4"
      >
        {navGroups.map((group) => (
          <li key={group.label}>
            <NavGroupSection
              group={group}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </Box>
    </Box>
  )
}
