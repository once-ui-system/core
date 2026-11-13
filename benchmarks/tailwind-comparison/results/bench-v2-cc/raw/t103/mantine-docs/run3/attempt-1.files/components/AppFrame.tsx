"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  Menu,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconTerminal2,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { getCrumbs } from "@/lib/nav";
import { NavList } from "./NavList";

function Logo() {
  return (
    <UnstyledButton component={Link} href="/" aria-label="Lumen home">
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon size={28} variant="filled" color="brand">
          <IconTerminal2 size={18} stroke={2} />
        </ThemeIcon>
        <Text ff="monospace" fw={700} size="lg" visibleFrom="sm">
          Lumen
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);
  const { toggleColorScheme } = useMantineColorScheme();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 48em)");

  return (
    <>
      <AppShell
        padding="md"
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 68 : 260,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" gap="sm" wrap="nowrap" justify="space-between">
            <Group gap="sm" wrap="nowrap" miw={0} style={{ flex: 1 }}>
              <Burger
                opened={drawerOpened}
                onClick={openDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
              />
              <Logo />
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
                aria-expanded={!collapsed}
                aria-controls="app-sidebar"
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={20} stroke={1.75} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={20} stroke={1.75} />
                )}
              </ActionIcon>
              <nav aria-label="Breadcrumb" style={{ minWidth: 0 }}>
                <Breadcrumbs separator="/" separatorMargin="xs" style={{ flexWrap: "nowrap" }}>
                  <Text size="sm" c="dimmed" truncate>
                    {crumbs.group}
                  </Text>
                  <Text size="sm" fw={600} truncate aria-current="page">
                    {crumbs.page}
                  </Text>
                </Breadcrumbs>
              </nav>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => toggleColorScheme()}
                aria-label="Toggle light and dark theme"
              >
                <Box component="span" lightHidden display="flex">
                  <IconSun size={18} stroke={1.75} />
                </Box>
                <Box component="span" darkHidden display="flex">
                  <IconMoon size={18} stroke={1.75} />
                </Box>
              </ActionIcon>
              <Menu position="bottom-end" width={240} withArrow>
                <Menu.Target>
                  <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                    <Group gap="xs" wrap="nowrap">
                      <Avatar color="brand" size="md">
                        {initials(user.name)}
                      </Avatar>
                      <Box visibleFrom="md">
                        <Text size="sm" fw={600} lh={1.2}>
                          {user.name}
                        </Text>
                        <Text size="xs" c="dimmed" lh={1.2}>
                          {user.role}
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.email}</Menu.Label>
                  <Menu.Item component={Link} href="/settings" leftSection={<IconSettings size={16} />}>
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />}>
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar id="app-sidebar" p="xs" aria-label="Sidebar">
          <AppShell.Section grow style={{ overflowY: "auto" }} pt="xs">
            <NavList collapsed={collapsed} />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main">{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened && !isDesktop}
        onClose={closeDrawer}
        size={280}
        padding="md"
        title={
          <Text ff="monospace" fw={700} size="lg">
            Lumen
          </Text>
        }
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavList onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
