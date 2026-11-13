"use client";

import { Box, Collapsible, Link, Span, Stack } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { LuChevronRight } from "react-icons/lu";
import { Tooltip } from "@/components/ui/tooltip";
import { isActive, navGroups, type NavItem } from "@/lib/nav";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function NavLinkItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Tooltip
      content={item.label}
      positioning={{ placement: "right" }}
      disabled={!collapsed}
    >
      <Link
        asChild
        variant="plain"
        display="flex"
        alignItems="center"
        gap="3"
        px="3"
        py="2"
        minH="9"
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
        borderRadius="l2"
        borderStartWidth="2px"
        borderStartColor="transparent"
        justifyContent={collapsed ? "center" : "flex-start"}
        textDecoration="none"
        _hover={{ bg: "bg.muted", color: "fg", textDecoration: "none" }}
        css={{
          "&[aria-current=page]": {
            bg: "colorPalette.muted",
            color: "colorPalette.fg",
            borderStartColor: "colorPalette.solid",
          },
        }}
      >
        <NextLink
          href={item.href}
          aria-current={active ? "page" : undefined}
          aria-label={collapsed ? item.label : undefined}
          onClick={onNavigate}
        >
          <Icon aria-hidden size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <Span>{item.label}</Span>}
        </NextLink>
      </Link>
    </Tooltip>
  );
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  return (
    <Box as="nav" aria-label="Main">
      <Stack gap={collapsed ? "3" : "4"}>
        {navGroups.map((group, index) =>
          collapsed ? (
            <Stack
              key={group.id}
              gap="1"
              role="group"
              aria-label={group.label}
              borderTopWidth={index === 0 ? "0" : "1px"}
              pt={index === 0 ? "0" : "3"}
            >
              {group.items.map((item) => (
                <NavLinkItem
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  collapsed
                  onNavigate={onNavigate}
                />
              ))}
            </Stack>
          ) : (
            <Collapsible.Root key={group.id} defaultOpen>
              <Collapsible.Trigger
                w="full"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px="3"
                py="1.5"
                fontFamily="heading"
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
                cursor="pointer"
                borderRadius="l2"
                _hover={{ color: "fg" }}
                css={{
                  "& .chev": { transition: "transform 0.15s ease" },
                  "&[data-state=open] .chev": { transform: "rotate(90deg)" },
                }}
              >
                {group.label}
                <LuChevronRight className="chev" aria-hidden />
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Stack gap="0.5" mt="1">
                  {group.items.map((item) => (
                    <NavLinkItem
                      key={item.href}
                      item={item}
                      active={isActive(pathname, item.href)}
                      collapsed={false}
                      onNavigate={onNavigate}
                    />
                  ))}
                </Stack>
              </Collapsible.Content>
            </Collapsible.Root>
          ),
        )}
      </Stack>
    </Box>
  );
}
