"use client";

import { AppShell, Avatar, Box, Button, Group, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconArmchair, IconLayoutDashboard, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutDashboard },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AppShell header={{ height: 60 }} padding={{ base: "sm", sm: "md" }} bg="gray.0">
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md" }} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <UnstyledButton component={Link} href="/" aria-label={`${APP_NAME}, seating plan`}>
              <Group gap={8} wrap="nowrap">
                <Box
                  bg="brand.9"
                  c="white"
                  w={32}
                  h={32}
                  style={{ borderRadius: 9, display: "grid", placeItems: "center" }}
                >
                  <IconArmchair size={20} stroke={1.8} aria-hidden />
                </Box>
                <Text fw={800} fz="lg" lh={1} c="dark.9" visibleFrom="xs">
                  {APP_NAME}
                </Text>
              </Group>
            </UnstyledButton>
            <Group gap={4} component="nav" aria-label="Main" wrap="nowrap">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray.7"}
                    size="sm"
                    leftSection={<Icon size={17} aria-hidden />}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>
          </Group>
          <Group gap="md" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text fz="sm" fw={600} lh={1.2}>
                {EVENT.name}
              </Text>
              <Text fz="xs" c="dimmed" lh={1.3}>
                {EVENT.venue}
              </Text>
            </Box>
            <Tooltip label={`${PLANNER.name}, planner`}>
              <Avatar color="brand" variant="filled" radius="xl" size={34}>
                {PLANNER.initials}
              </Avatar>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main id="main">{children}</AppShell.Main>
    </AppShell>
  );
}
