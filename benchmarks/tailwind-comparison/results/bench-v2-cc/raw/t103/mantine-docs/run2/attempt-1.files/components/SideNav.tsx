"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { navGroups } from "@/lib/nav";

interface SideNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SideNav({ collapsed = false, onNavigate }: SideNavProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Main navigation">
        <Stack gap="xs" align="center">
          {navGroups.map((group, index) => (
            <Stack key={group.label} gap="xs" align="center" role="group" aria-label={group.label}>
              {index > 0 && <Divider w={32} aria-hidden />}
              {group.items.map((item) => {
                const active = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                  <Tooltip key={item.href} label={`${group.label} / ${item.label}`} position="right">
                    <ActionIcon
                      component={Link}
                      href={item.href}
                      size={40}
                      variant={active ? "filled" : "subtle"}
                      color={active ? "brand" : "gray"}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                    >
                      <ItemIcon size={20} stroke={1.75} aria-hidden />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </nav>
    );
  }

  return (
    <nav aria-label="Main navigation">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={18} stroke={1.75} aria-hidden />}
            defaultOpened
            childrenOffset={16}
            fw={600}
          >
            {group.items.map((item) => {
              const active = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<ItemIcon size={18} stroke={1.75} aria-hidden />}
                  active={active}
                  variant="filled"
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  fw={500}
                />
              );
            })}
          </NavLink>
        );
      })}
    </nav>
  );
}
