"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "@/lib/nav";

interface NavListProps {
  /** Icons only (desktop sidebar collapsed). */
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function NavList({ collapsed = false, onNavigate }: NavListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <Stack gap="xs" align="center" component="ul" m={0} p={0} style={{ listStyle: "none" }}>
        {navGroups.map((group, index) => (
          <li key={group.label} style={{ display: "contents" }}>
            {index > 0 && <Divider w="60%" my={4} aria-hidden />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={`${group.label}: ${item.label}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <Icon size={20} stroke={1.75} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </li>
        ))}
      </Stack>
    );
  }

  return (
    <nav aria-label="Main">
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={18} stroke={1.75} />}
            childrenOffset={16}
            defaultOpened
            fw={600}
          >
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  leftSection={<Icon size={16} stroke={1.75} />}
                  active={active}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                />
              );
            })}
          </NavLink>
        );
      })}
    </nav>
  );
}
