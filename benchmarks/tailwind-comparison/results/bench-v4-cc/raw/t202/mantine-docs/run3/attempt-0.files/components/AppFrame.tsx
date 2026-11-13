"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Box, Button, Container, Group, Text, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconArmchair, IconLayoutGrid, IconUsers } from "@tabler/icons-react";
import { APP_NAME, PLANNER } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const NAV = [
  { href: "/", label: "Plan", icon: IconLayoutGrid },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { announcement } = usePlan();

  return (
    <Box mih="100dvh" style={{ background: "#f6f5f2" }}>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--mantine-color-white)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <Container size={1400} px="md" py={8}>
          <Group justify="space-between" wrap="wrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={34} radius="md" aria-hidden>
                <IconArmchair size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} lh={1.1}>
                  {APP_NAME}
                </Text>
                <Text size="xs" c="gray.7" lh={1.2}>
                  Seating planner
                </Text>
              </div>
            </Group>
            <Group component="nav" aria-label="Main" gap={4} wrap="nowrap">
              {NAV.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    variant={active ? "light" : "subtle"}
                    color={active ? "fig" : "gray.8"}
                    leftSection={<Icon size={18} />}
                    size="sm"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" c="gray.8" visibleFrom="sm">
                {PLANNER.name}
              </Text>
              <Avatar color="fig" radius="xl" size={32} aria-label={PLANNER.name}>
                HB
              </Avatar>
            </Group>
          </Group>
        </Container>
      </Box>
      <VisuallyHidden role="status" aria-live="polite">
        {announcement}
      </VisuallyHidden>
      <main>{children}</main>
    </Box>
  );
}
