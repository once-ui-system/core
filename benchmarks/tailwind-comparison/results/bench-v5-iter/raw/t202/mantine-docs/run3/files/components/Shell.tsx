"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Avatar, Box, Button, Container, Group, Text, ThemeIcon, VisuallyHidden } from "@mantine/core";
import { IconArmchair, IconMap2, IconUsers } from "@tabler/icons-react";
import { APP, EVENT, PLANNER, formatEventDate, initials } from "@/lib/data";
import { DragProvider } from "@/lib/drag";
import { PlanProvider, usePlan } from "@/lib/plan";

const NAV = [
  { href: "/", label: "Plan", icon: IconMap2 },
  { href: "/guests", label: "Guests", icon: IconUsers },
];

function LiveStatus() {
  const { status } = usePlan();
  return (
    <VisuallyHidden role="status" aria-live="polite">
      {status}
    </VisuallyHidden>
  );
}

function Header() {
  const pathname = usePathname();
  return (
    <Box
      component="header"
      bg="white"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-3)", position: "sticky", top: 0, zIndex: 20 }}
    >
      <Container fluid px="md" maw={1680}>
        <Group justify="space-between" wrap="wrap" gap="xs" py="xs" mih={60}>
          <Group gap="sm" wrap="nowrap">
            <Anchor component={Link} href="/" underline="never" c="inherit" aria-label={`${APP}, plan`}>
              <Group gap={8} wrap="nowrap">
                <ThemeIcon size={34} radius="md" variant="filled">
                  <IconArmchair size={20} aria-hidden />
                </ThemeIcon>
                <Text fw={700} size="lg" lh={1}>
                  {APP}
                </Text>
              </Group>
            </Anchor>
            <Box visibleFrom="md" pl="md" ml="xs" style={{ borderLeft: "1px solid var(--mantine-color-gray-3)" }}>
              <Text fw={600} size="sm" lh={1.25}>
                {EVENT.name}
              </Text>
              <Text size="xs" c="gray.7" lh={1.25}>
                {formatEventDate()} · {EVENT.venue}
              </Text>
            </Box>
          </Group>

          <Group gap="xs" wrap="nowrap">
            <Box component="nav" aria-label="Main">
              <Group gap={4} wrap="nowrap">
                {NAV.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      variant={active ? "light" : "subtle"}
                      color={active ? "brand" : "gray.7"}
                      size="sm"
                      leftSection={<item.icon size={18} aria-hidden />}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Group>
            </Box>
            <Group gap="xs" wrap="nowrap" visibleFrom="sm" pl="xs">
              <Avatar radius="xl" size={34} color="brand" aria-hidden>
                {initials(PLANNER.name)}
              </Avatar>
              <Text size="sm" fw={500}>
                {PLANNER.name}
              </Text>
            </Group>
          </Group>
        </Group>
        <Box hiddenFrom="md" pb="xs">
          <Text fw={600} size="sm" lh={1.25}>
            {EVENT.name}
          </Text>
          <Text size="xs" c="gray.7" lh={1.25}>
            {formatEventDate()} · {EVENT.venue}
          </Text>
        </Box>
      </Container>
    </Box>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <PlanProvider>
      <DragProvider>
        <Box mih="100dvh" bg="gray.0">
          <Header />
          <LiveStatus />
          <Box component="main" id="main">
            <Container fluid px="md" py="md" maw={1680}>
              {children}
            </Container>
          </Box>
        </Box>
      </DragProvider>
    </PlanProvider>
  );
}
