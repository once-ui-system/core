"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { navGroups } from "./nav-config";

interface NavListProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Stack gap="xs" align="center">
        {navGroups.map((group, index) => (
          <Stack key={group.label} gap="xs" align="center" w="100%">
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size={48}
                    radius="md"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={24} stroke={1.8} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={22} stroke={1.8} aria-hidden />}
          defaultOpened
          childrenOffset={24}
          py="sm"
          fw={600}
        >
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.8} aria-hidden />}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                py="sm"
                mb={4}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}
