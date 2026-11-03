"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Heading, Icon, Span, Stack } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { NavIcon } from "@/components/nav-icon";
import { navGroups, type NavItem } from "@/lib/data";

interface NavListProps {
  /** Icon-only mode (desktop sidebar collapsed). */
  collapsed?: boolean;
  /** Called after a link is activated (used to close the mobile drawer). */
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label="Main navigation">
      <Stack gap={collapsed ? "4" : "6"} as="div">
        {navGroups.map((group, gi) => {
          const headingId = `nav-group-${gi}`;
          return (
            <Box key={group.label} role="group" aria-labelledby={headingId}>
              <Heading
                id={headingId}
                as="h2"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                fontWeight="semibold"
                px="3"
                mb="2"
                // Keep the label available to assistive tech when collapsed.
                srOnly={collapsed}
              >
                {group.label}
              </Heading>
              <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    active={item.href === pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

interface NavLinkProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}

function NavLink({ item, collapsed, active, onNavigate }: NavLinkProps) {
  const itemStyles = {
    display: "flex",
    alignItems: "center",
    gap: "3",
    px: "3",
    py: "2",
    rounded: "md",
    fontSize: "sm",
    fontWeight: active ? "semibold" : "medium",
    justifyContent: collapsed ? "center" : "flex-start",
    bg: active ? "colorPalette.subtle" : "transparent",
    color: active ? "colorPalette.fg" : "fg",
    colorPalette: "blue",
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "colorPalette.focusRing",
    },
  } as const;

  const content = (
    <>
      <Icon fontSize="lg" flexShrink={0}>
        <NavIcon name={item.icon} />
      </Icon>
      {collapsed ? <Span srOnly>{item.label}</Span> : <Span>{item.label}</Span>}
    </>
  );

  if (!item.href) {
    // No route yet: expose as an unavailable item rather than a dead link.
    return (
      <li>
        <Tooltip
          content={`${item.label} (coming soon)`}
          positioning={{ placement: "right" }}
          disabled={!collapsed}
        >
          <Flex
            {...itemStyles}
            role="link"
            tabIndex={0}
            aria-disabled="true"
            color="fg.muted"
            cursor="not-allowed"
            _hover={{}}
          >
            {content}
            {!collapsed && (
              <Span ms="auto" fontSize="xs" color="fg.subtle">
                Soon
              </Span>
            )}
          </Flex>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Tooltip
        content={item.label}
        positioning={{ placement: "right" }}
        disabled={!collapsed}
      >
        <Flex
          asChild
          {...itemStyles}
          _hover={{ bg: active ? "colorPalette.subtle" : "bg.muted" }}
        >
          <NextLink
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {content}
          </NextLink>
        </Flex>
      </Tooltip>
    </li>
  );
}
