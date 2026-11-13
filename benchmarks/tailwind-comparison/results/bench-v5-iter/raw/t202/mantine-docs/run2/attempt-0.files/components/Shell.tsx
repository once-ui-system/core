"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppShell,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Progress,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { IconArmchair, IconLayoutGrid, IconUsers } from "@tabler/icons-react";
import { app, planner } from "@/lib/data";
import { initials } from "@/lib/plan";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stats } = usePlan();
  const pct = stats.attending > 0 ? Math.min(100, (stats.seated / stats.attending) * 100) : 0;

  return (
    <AppShell header={{ height: 64 }} padding={{ base: "sm", sm: "md" }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <UnstyledButton component={Link} href="/" aria-label={`${app.name}, back to the plan`}>
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={36} radius="md" variant="gradient" gradient={{ from: "brand.6", to: "grape.6", deg: 135 }}>
                  <IconArmchair size={22} />
                </ThemeIcon>
                <Text fw={800} fz={20} style={{ letterSpacing: -0.3 }}>
                  {app.name}
                </Text>
              </Group>
            </UnstyledButton>
            <Divider orientation="vertical" visibleFrom="xs" />
            <Box component="nav" aria-label="Main" style={{ display: "flex", gap: 4 }}>
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "brand" : "gray"}
                    size="sm"
                    leftSection={<item.icon size={16} />}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Group>
          <Group gap="lg" wrap="nowrap">
            <Box visibleFrom="md" w={190}>
              <Group justify="space-between" mb={4}>
                <Text size="xs" fw={600}>
                  {stats.seated} seated
                </Text>
                <Text size="xs" c="dimmed">
                  {stats.toSeat} to seat
                </Text>
              </Group>
              <Progress value={pct} size="sm" aria-label={`${stats.seated} guests seated, ${stats.toSeat} attending guests still to seat`} />
            </Box>
            <Group gap="xs" wrap="nowrap">
              <Avatar color="brand" radius="xl" size={34} aria-hidden>
                {initials(planner.name)}
              </Avatar>
              <Box visibleFrom="sm">
                <Text size="sm" fw={600} lh={1.2}>
                  {planner.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  Wedding planner
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main
        id="main"
        style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
      >
        <Container size={1680} p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
