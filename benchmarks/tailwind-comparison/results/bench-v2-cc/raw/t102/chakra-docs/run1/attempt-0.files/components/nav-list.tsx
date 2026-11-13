"use client"

import { Box, Icon, Link, Separator, Stack, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip } from "@/components/ui/tooltip"
import { navGroups } from "@/lib/nav"

interface NavListProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname()

  return (
    <Box asChild>
      <nav aria-label="Main">
        <Stack asChild gap={collapsed ? "3" : "7"}>
          <ul>
            {navGroups.map((group, index) => (
              <li key={group.label}>
                {collapsed ? (
                  index > 0 && <Separator mb="3" />
                ) : (
                  <Text
                    textStyle="xs"
                    fontWeight="semibold"
                    letterSpacing="wider"
                    textTransform="uppercase"
                    color="fg.muted"
                    px="4"
                    mb="2"
                  >
                    {group.label}
                  </Text>
                )}
                <Stack asChild gap="1">
                  <ul aria-label={group.label}>
                    {group.items.map((item) => {
                      const active = item.match === pathname
                      const IconGlyph = item.icon
                      return (
                        <li key={item.href}>
                          <Tooltip
                            content={item.label}
                            disabled={!collapsed}
                            showArrow
                            positioning={{ placement: "right" }}
                          >
                            <Link
                              asChild
                              colorPalette="brand"
                              display="flex"
                              alignItems="center"
                              gap="3"
                              minH="12"
                              px={collapsed ? "0" : "4"}
                              w={collapsed ? "12" : "full"}
                              mx={collapsed ? "auto" : "0"}
                              justifyContent={collapsed ? "center" : "flex-start"}
                              borderRadius="l2"
                              fontWeight="medium"
                              textDecoration="none"
                              color={active ? "colorPalette.contrast" : "fg"}
                              bg={active ? "colorPalette.solid" : "transparent"}
                              _hover={{
                                textDecoration: "none",
                                bg: active ? "colorPalette.solid" : "bg.muted",
                              }}
                            >
                              <NextLink
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                aria-label={collapsed ? item.label : undefined}
                                onClick={onNavigate}
                              >
                                <Icon boxSize="5" flexShrink={0}>
                                  <IconGlyph />
                                </Icon>
                                {!collapsed && <span>{item.label}</span>}
                              </NextLink>
                            </Link>
                          </Tooltip>
                        </li>
                      )
                    })}
                  </ul>
                </Stack>
              </li>
            ))}
          </ul>
        </Stack>
      </nav>
    </Box>
  )
}
