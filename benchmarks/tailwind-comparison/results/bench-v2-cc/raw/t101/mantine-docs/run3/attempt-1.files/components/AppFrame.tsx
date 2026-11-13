"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Breadcrumbs,
  Burger,
  Drawer,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { user } from "@/lib/data";
import { findCrumbs } from "./nav-config";
import { SidebarNav } from "./SidebarNav";

const initials = user.name
  .split(" ")
  .map((part) => part[0])
  .join("");

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = findCrumbs(pathname);

  return (
    <AppShell
      padding="md"
      header={{ height: 44 }}
      navbar={{
        width: collapsed ? 48 : 208,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="sm" gap="sm" wrap="nowrap" justify="space-between">
          <Group gap="sm" wrap="nowrap" miw={0}>
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              size="sm"
              aria-label={drawerOpened ? "Close navigation" : "Open navigation"}
            />
            <ActionIcon
              visibleFrom="sm"
              variant="subtle"
              color="gray"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={18} stroke={1.75} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={18} stroke={1.75} />
              )}
            </ActionIcon>
            <Text component={Link} href="/" ff="heading" fw={700} fz="lg" c="brand.6" td="none">
              Lumen
            </Text>
            <nav aria-label="Breadcrumb">
              <Breadcrumbs separator="/" separatorMargin={6}>
                {crumbs.group ? (
                  <Text key="group" size="sm" c="dimmed">
                    {crumbs.group}
                  </Text>
                ) : null}
                <Text key="page" size="sm" fw={600} aria-current="page">
                  {crumbs.page}
                </Text>
              </Breadcrumbs>
            </nav>
          </Group>

          <Menu position="bottom-end" width={220}>
            <Menu.Target>
              <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                <Avatar color="brand" size="sm" radius={999}>
                  {initials}
                </Avatar>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                {user.name} ({user.role})
                <br />
                {user.email}
              </Menu.Label>
              <Menu.Item
                component={Link}
                href="/settings"
                leftSection={<IconSettings size={14} stroke={1.75} />}
              >
                Settings
              </Menu.Item>
              <Menu.Item
                leftSection={<IconLogout size={14} stroke={1.75} />}
                onClick={() => {
                  notifications.show({
                    title: "Signed out",
                    message: "You have been signed out of this demo session.",
                  });
                }}
              >
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" visibleFrom="sm">
        <AppShell.Section grow>
          <SidebarNav pathname={pathname} collapsed={collapsed} label="Primary" />
        </AppShell.Section>
        {!collapsed && (
          <AppShell.Section>
            <Text size="sm" fw={600}>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {user.role}, {user.email}
            </Text>
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Lumen"
        size={264}
        padding="sm"
        hiddenFrom="sm"
        closeButtonProps={{ "aria-label": "Close navigation" }}
      >
        <SidebarNav pathname={pathname} label="Mobile" onNavigate={closeDrawer} />
      </Drawer>

      <AppShell.Main bg="gray.0">{children}</AppShell.Main>
    </AppShell>
  );
}
