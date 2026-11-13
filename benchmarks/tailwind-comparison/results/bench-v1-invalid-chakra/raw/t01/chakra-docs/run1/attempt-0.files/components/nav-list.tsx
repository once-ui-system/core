"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import {
  LuChartColumn,
  LuFileText,
  LuFolderKanban,
  LuSettings,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { navGroups, type NavIconName } from "@/lib/data";
import { Tooltip } from "@/components/ui/tooltip";

const icons: Record<NavIconName, IconType> = {
  overview: LuChartColumn,
  reports: LuFileText,
  projects: LuFolderKanban,
  settings: LuSettings,
};

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label="Main">
      <Stack gap="5" as="ul" listStyleType="none" m="0" p="0">
        {navGroups.map((group) => {
          const headingId = `nav-group-${group.label.toLowerCase()}`;
          return (
            <Box as="li" key={group.label}>
              <Text
                id={headingId}
                textStyle="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                px="3"
                mb="1"
                srOnly={collapsed}
              >
                {group.label}
              </Text>
              {collapsed && (
                <Box
                  borderTopWidth="1px"
                  borderColor="border.muted"
                  mx="2"
                  mb="2"
                  aria-hidden="true"
                />
              )}
              <Stack
                as="ul"
                gap="1"
                listStyleType="none"
                m="0"
                p="0"
                aria-labelledby={headingId}
              >
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const ItemIcon = icons[item.icon];
                  return (
                    <Box as="li" key={item.href}>
                      <Tooltip
                        content={item.label}
                        positioning={{ placement: "right" }}
                        disabled={!collapsed}
                        openDelay={200}
                      >
                        <NextLink
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          aria-label={collapsed ? item.label : undefined}
                          onClick={onNavigate}
                          style={{ display: "block", textDecoration: "none" }}
                        >
                          <Flex
                            align="center"
                            gap="3"
                            px="3"
                            py="2"
                            rounded="md"
                            justify={collapsed ? "center" : "flex-start"}
                            fontWeight={active ? "semibold" : "medium"}
                            textStyle="sm"
                            colorPalette="blue"
                            bg={active ? "colorPalette.subtle" : "transparent"}
                            color={active ? "colorPalette.fg" : "fg"}
                            _hover={{
                              bg: active ? "colorPalette.subtle" : "bg.muted",
                            }}
                            transition="background 0.15s"
                          >
                            <Icon boxSize="5" flexShrink="0">
                              <ItemIcon />
                            </Icon>
                            {!collapsed && <span>{item.label}</span>}
                          </Flex>
                        </NextLink>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
