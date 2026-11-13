"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Tooltip, UnstyledButton, Divider } from "@mantine/core";
import { isActive, navGroups } from "@/lib/navigation";
import classes from "./NavContent.module.css";

interface NavContentProps {
  /** Icon-only rail (desktop collapsed state). */
  collapsed?: boolean;
  /** Called after a link is followed, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

export function NavContent({ collapsed = false, onNavigate }: NavContentProps) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Primary">
        <Stack gap={4} align="center">
          {navGroups.map((group, index) => (
            <Stack
              key={group.label}
              gap={4}
              align="center"
              component="ul"
              className={classes.list}
              aria-label={group.label}
            >
              {index > 0 && (
                <li aria-hidden>
                  <Divider w={24} my={4} />
                </li>
              )}
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Tooltip
                      label={`${group.label} · ${item.label}`}
                      position="right"
                      events={{ hover: true, focus: true, touch: true }}
                    >
                      <UnstyledButton
                        component={Link}
                        href={item.href}
                        className={classes.iconLink}
                        data-active={active || undefined}
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavigate}
                      >
                        <item.icon size={20} stroke={1.6} />
                      </UnstyledButton>
                    </Tooltip>
                  </li>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </nav>
    );
  }

  return (
    <nav aria-label="Primary">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={18} stroke={1.6} />}
          childrenOffset={16}
          defaultOpened
          variant="subtle"
          fw={600}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.6} />}
                active={active}
                aria-current={active ? "page" : undefined}
                variant="light"
                fw={500}
                onClick={onNavigate}
              />
            );
          })}
        </NavLink>
      ))}
    </nav>
  );
}
