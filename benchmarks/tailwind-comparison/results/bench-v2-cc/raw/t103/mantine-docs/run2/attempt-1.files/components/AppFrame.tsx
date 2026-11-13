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
  Text,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { crumbsFor } from "@/lib/nav";
import { SideNav } from "./SideNav";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const { toggleColorScheme } = useMantineColorScheme();
  const crumbs = crumbsFor(pathname);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: collapsed ? 68 : 248,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Burger
              opened={drawerOpened}
              onClick={drawer.toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open navigation menu"
            />
            <Anchor
              component={Link}
              href="/"
              underline="never"
              c="inherit"
              fw={700}
              ff="heading"
              visibleFrom="sm"
              aria-label="Lumen home"
            >
              <Group gap={8} wrap="nowrap">
                <Box w={12} h={12} bg="brand" style={{ borderRadius: 4 }} aria-hidden />
                lumen
              </Group>
            </Anchor>
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={20} aria-hidden />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={20} aria-hidden />
                )}
              </ActionIcon>
            </Tooltip>
            <nav aria-label="Breadcrumb" style={{ minWidth: 0 }}>
              <Breadcrumbs separatorMargin="xs">
                {crumbs.map((crumb, index) =>
                  index === crumbs.length - 1 ? (
                    <Text key={crumb.label} size="sm" fw={600} aria-current="page" truncate>
                      {crumb.label}
                    </Text>
                  ) : (
                    <Text key={crumb.label} size="sm" c="dimmed">
                      {crumb.label}
                    </Text>
                  ),
                )}
              </Breadcrumbs>
            </nav>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={toggleColorScheme}
              aria-label="Toggle colour scheme"
            >
              <Box component="span" darkHidden style={{ display: "inline-flex" }}>
                <IconSun size={20} aria-hidden />
              </Box>
              <Box component="span" lightHidden style={{ display: "inline-flex" }}>
                <IconMoon size={20} aria-hidden />
              </Box>
            </ActionIcon>
            <Avatar color="brand" size="sm" radius="sm" aria-label={user.name}>
              {initials(user.name)}
            </Avatar>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component="div">
          <SideNav collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section>
          {collapsed ? (
            <Group justify="center" py="xs">
              <Avatar color="brand" size="md" radius="sm" aria-label={`${user.name}, ${user.role}`}>
                {initials(user.name)}
              </Avatar>
            </Group>
          ) : (
            <Group gap="sm" p="xs" wrap="nowrap">
              <Avatar color="brand" radius="sm" aria-hidden>
                {initials(user.name)}
              </Avatar>
              <Box miw={0}>
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
        opened={drawerOpened}
        onClose={drawer.close}
        title={
          <Text ff="heading" fw={700}>
            lumen
          </Text>
        }
        size="xs"
        padding="sm"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <SideNav onNavigate={drawer.close} />
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
