"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  ScrollArea,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconSparkles } from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { NavList } from "./NavList";
import { findCrumbs } from "./nav-config";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 48em)");
  const crumbs = findCrumbs(pathname);

  useEffect(() => {
    drawer.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isDesktop) drawer.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop]);

  const navbarWidth = collapsed ? 96 : 300;

  return (
    <AppShell
      header={{ height: 76 }}
      navbar={{ width: navbarWidth, breakpoint: "sm", collapsed: { mobile: true } }}
      padding={{ base: "md", sm: "xl" }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md" }} gap="sm" wrap="nowrap">
          <Burger
            opened={drawerOpen}
            onClick={drawer.toggle}
            hiddenFrom="sm"
            size="md"
            aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          />
          <Group gap="xs" wrap="nowrap" component={Link} href="/" style={{ textDecoration: "none", color: "inherit" }} aria-label="Lumen home">
            <ThemeIcon size={44} radius="md" variant="filled" color="brand">
              <IconSparkles size={26} aria-hidden />
            </ThemeIcon>
            <Title order={3} visibleFrom="sm">
              Lumen
            </Title>
          </Group>
          <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} withArrow>
            <ActionIcon
              visibleFrom="sm"
              variant="subtle"
              color="gray"
              size={44}
              radius="md"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={24} aria-hidden />
              ) : (
                <IconLayoutSidebarLeftCollapse size={24} aria-hidden />
              )}
            </ActionIcon>
          </Tooltip>
          <Box style={{ minWidth: 0, flex: 1 }}>
            {crumbs && (
              <Breadcrumbs separator="/" aria-label="Breadcrumb" style={{ flexWrap: "nowrap" }}>
                <Anchor component={Link} href="/" size="md">
                  Lumen
                </Anchor>
                <Text size="md" c="dimmed">
                  {crumbs.group}
                </Text>
                <Text size="md" fw={600} aria-current="page">
                  {crumbs.label}
                </Text>
              </Breadcrumbs>
            )}
          </Box>
          <Group gap="sm" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text size="sm" fw={600} lh={1.2}>
                {user.name}
              </Text>
              <Text size="xs" c="dimmed">
                {user.role}
              </Text>
            </Box>
            <Avatar color="brand" radius="xl" size={44} aria-label={user.name}>
              {initials(user.name)}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" aria-label="Main navigation">
        <AppShell.Section grow component={ScrollArea}>
          <NavList collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section pt="md">
          {collapsed ? (
            <Group justify="center">
              <Avatar color="brand" radius="xl" size={44} aria-label={user.name}>
                {initials(user.name)}
              </Avatar>
            </Group>
          ) : (
            <Group gap="sm" wrap="nowrap">
              <Avatar color="brand" radius="xl" size={44}>
                {initials(user.name)}
              </Avatar>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user.email}
                </Text>
              </Box>
            </Group>
          )}
        </AppShell.Section>
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpen}
        onClose={drawer.close}
        title="Navigation"
        size="min(320px, 85vw)"
        padding="md"
      >
        <nav aria-label="Main navigation">
          <NavList onNavigate={drawer.close} />
        </nav>
      </Drawer>

      <AppShell.Main bg="var(--mantine-color-sand-0)" id="main-content">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
