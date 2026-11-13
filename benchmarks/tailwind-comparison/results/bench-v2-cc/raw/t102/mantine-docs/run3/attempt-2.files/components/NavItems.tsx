"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Box, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "@/lib/nav";

interface NavItemsProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavItems({ collapsed = false, onNavigate }: NavItemsProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Box component="nav" aria-label="Main navigation">
        <Stack gap="xs" align="center">
          {navGroups.map((group, index) => (
            <Stack key={group.label} gap="xs" align="center" role="group" aria-label={group.label}>
              {index > 0 && <Divider w={32} />}
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Tooltip
                    key={item.href}
                    label={`${group.label}: ${item.label}`}
                    position="right"
                    withArrow
                  >
                    <ActionIcon
                      component={Link}
                      href={item.href}
                      size={48}
                      variant={active ? "light" : "subtle"}
                      color={active ? "brand" : "sand.8"}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon size={22} stroke={1.75} aria-hidden />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="nav" aria-label="Main navigation">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={20} stroke={1.75} aria-hidden />}
          defaultOpened
          childrenOffset={28}
          fw={700}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.75} aria-hidden />}
                active={active}
                variant="light"
                color="brand"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                fw={active ? 700 : 500}
              />
            );
          })}
        </NavLink>
      ))}
    </Box>
  );
}
