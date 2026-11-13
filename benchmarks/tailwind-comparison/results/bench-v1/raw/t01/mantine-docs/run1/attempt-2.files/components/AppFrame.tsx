"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSparkles,
} from "@tabler/icons-react";
import { getBreadcrumbs } from "@/lib/navigation";
import { user } from "@/lib/data";
import { NavContent } from "./NavContent";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Anchor
      component={Link}
      href="/"
      underline="never"
      c="inherit"
      aria-label="Lumen home"
    >
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon
          size={32}
          radius="md"
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          <IconSparkles size={18} />
        </ThemeIcon>
        {!compact && (
          <Text fw={700} size="lg">
            Lumen
          </Text>
        )}
      </Group>
    </Anchor>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);

  const crumbs = getBreadcrumbs(pathname);
  const crumbItems = crumbs.map((crumb, index) => {
    const last = index === crumbs.length - 1;
    if (last) {
      return (
        <Text key={crumb.label} size="sm" fw={600} aria-current="page">
          {crumb.label}
        </Text>
      );
    }
    return crumb.href ? (
      <Anchor
        key={crumb.label}
        component={Link}
        href={crumb.href}
        size="sm"
        c="dimmed"
      >
        {crumb.label}
      </Anchor>
    ) : (
      <Text key={crumb.label} size="sm" c="dimmed">
        {crumb.label}
      </Text>
    );
  });

  return (
    <>
      <AppShell
        padding={{ base: "md", sm: "xl" }}
        header={{ height: 60 }}
        navbar={{
          width: collapsed ? 72 : 260,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" miw={0}>
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpened}
              />
              <Box hiddenFrom="sm">
                <Brand compact />
              </Box>
              <Breadcrumbs
                separator="/"
                separatorMargin={6}
                aria-label="Breadcrumb"
                style={{ flexWrap: "nowrap", overflow: "hidden" }}
              >
                {crumbItems}
              </Breadcrumbs>
            </Group>
            <Group gap="sm" wrap="nowrap">
              <Box visibleFrom="xs" ta="right">
                <Text size="sm" fw={600} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="indigo" radius="xl" size={36} aria-label={user.name}>
                {initials(user.name)}
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="sm" aria-label="Sidebar">
          <AppShell.Section>
            <Group
              justify={collapsed ? "center" : "space-between"}
              wrap="nowrap"
              mb="sm"
              px={collapsed ? 0 : "xs"}
              h={36}
            >
              <Brand compact={collapsed} />
            </Group>
          </AppShell.Section>
          <AppShell.Section grow component={ScrollArea}>
            <NavContent collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section>
            <Group justify={collapsed ? "center" : "flex-end"} pt="sm">
              <Tooltip
                label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                position="right"
                events={{ hover: true, focus: true, touch: true }}
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={toggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  aria-pressed={collapsed}
                >
                  {collapsed ? (
                    <IconLayoutSidebarLeftExpand size={20} />
                  ) : (
                    <IconLayoutSidebarLeftCollapse size={20} />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Lumen navigation"
        size="xs"
        hiddenFrom="sm"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavContent onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
