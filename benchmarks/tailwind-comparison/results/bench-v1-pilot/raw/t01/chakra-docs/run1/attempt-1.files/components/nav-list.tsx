"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Box, Flex, Heading, Icon, Span } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { NavIcon } from "@/components/nav-icon";
import { useMounted } from "@/components/use-mounted";
import { navGroups, type NavItem } from "@/lib/data";

interface NavListProps {
  /** Icon-only mode (desktop sidebar collapsed). */
  collapsed?: boolean;
  /** Prefix that keeps element ids unique when the list is rendered twice. */
  idPrefix: string;
  /** Called after a link is activated (used to close the mobile drawer). */
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, idPrefix, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label={`Main navigation${idPrefix === "drawer" ? " (menu)" : ""}`}>
      <Flex direction="column" gap={collapsed ? "4" : "6"}>
        {navGroups.map((group, gi) => {
          const headingId = `${idPrefix}-nav-group-${gi}`;
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
                srOnly={collapsed}
              >
                {group.label}
              </Heading>
              <Box
                as="ul"
                display="flex"
                flexDirection="column"
                gap="1"
                listStyleType="none"
                m="0"
                p="0"
              >
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    active={item.href === pathname}
                    onNavigate={onNavigate}
                  />
                ))}
              </Box>
            </Box>
          );
        })}
      </Flex>
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
  const mounted = useMounted();
  const showTooltip = mounted && collapsed;

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
    bg: active ? "blue.subtle" : "transparent",
    color: active ? "blue.fg" : "fg",
    outline: "none",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "blue.focusRing",
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
    // No route for this item yet: expose it as unavailable rather than a dead link.
    return (
      <li>
        <Tooltip
          content={`${item.label} (coming soon)`}
          positioning={{ placement: "right" }}
          disabled={!showTooltip}
        >
          <Box
            {...itemStyles}
            role="link"
            tabIndex={0}
            aria-disabled="true"
            color="fg.muted"
            cursor="not-allowed"
          >
            {content}
            {!collapsed && (
              <Span ms="auto" fontSize="xs" color="fg.subtle">
                Soon
              </Span>
            )}
          </Box>
        </Tooltip>
      </li>
    );
  }

  return (
    <li>
      <Tooltip
        content={item.label}
        positioning={{ placement: "right" }}
        disabled={!showTooltip}
      >
        <Box
          asChild
          {...itemStyles}
          _hover={{ bg: active ? "blue.subtle" : "bg.muted" }}
        >
          <NextLink
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
          >
            {content}
          </NextLink>
        </Box>
      </Tooltip>
    </li>
  );
}
