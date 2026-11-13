"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Box, Button, Container, Group, Text, ThemeIcon } from "@mantine/core";
import { IconArmchair, IconCalendarEvent, IconLayoutGrid, IconMapPin, IconUsers } from "@tabler/icons-react";
import { APP_NAME, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data";
import { PlanProvider } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Seating plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guest list", icon: IconUsers },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <PlanProvider>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Container size="xl" py="xs">
          <Group justify="space-between" gap="sm" wrap="wrap">
            <Group gap="md" wrap="wrap">
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={34} radius="md" variant="filled" aria-hidden>
                  <IconArmchair size={20} />
                </ThemeIcon>
                <Text fw={800} size="lg" style={{ letterSpacing: "-0.02em" }}>
                  {APP_NAME}
                </Text>
              </Group>
              <Group gap={4} component="nav" aria-label="Main">
                {NAV.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant={active ? "light" : "subtle"}
                      color={active ? undefined : "gray"}
                      size="sm"
                      leftSection={<item.icon size={16} />}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Group>
            </Group>
            <Group gap="md" wrap="nowrap">
              <Box visibleFrom="md" style={{ textAlign: "right" }}>
                <Text size="sm" fw={600} lh={1.2}>
                  {EVENT.name}
                </Text>
                <Group gap={10} justify="flex-end" c="dimmed">
                  <Group gap={4} wrap="nowrap">
                    <IconCalendarEvent size={13} aria-hidden />
                    <Text size="xs">{formatEventDate(EVENT.date)}</Text>
                  </Group>
                  <Group gap={4} wrap="nowrap">
                    <IconMapPin size={13} aria-hidden />
                    <Text size="xs">{EVENT.venue}</Text>
                  </Group>
                </Group>
              </Box>
              <Avatar color="indigo" radius="xl" size="md" title={PLANNER.name} aria-label={`Signed in as ${PLANNER.name}`}>
                {initials(PLANNER.name)}
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Box>
      <Box component="main">{children}</Box>
    </PlanProvider>
  );
}
