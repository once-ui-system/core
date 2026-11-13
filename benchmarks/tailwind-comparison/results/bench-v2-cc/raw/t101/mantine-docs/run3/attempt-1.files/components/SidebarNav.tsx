"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ActionIcon, Divider, NavLink, Stack, Tooltip } from "@mantine/core";
import { isActive, navGroups } from "./nav-config";

interface SidebarNavProps {
  pathname: string;
  collapsed?: boolean;
  label: string;
  onNavigate?: () => void;
}

export function SidebarNav({ pathname, collapsed = false, label, onNavigate }: SidebarNavProps) {
  if (collapsed) {
    return (
      <Stack component="nav" aria-label={label} gap={4} align="center">
        {navGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <Divider w="100%" aria-hidden="true" />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right">
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={18} stroke={1.75} />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </Stack>
    );
  }

  return (
    <nav aria-label={label}>
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={16} stroke={1.75} />}
          childrenOffset={14}
          defaultOpened
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={16} stroke={1.75} />}
                active={active}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              />
            );
          })}
        </NavLink>
      ))}
    </nav>
  );
}
