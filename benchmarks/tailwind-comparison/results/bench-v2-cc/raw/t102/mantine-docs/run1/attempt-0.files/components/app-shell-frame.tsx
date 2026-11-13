"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Container,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconFolders,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { user, userInitials } from "@/lib/data";
import { findNav, isActive, navGroups } from "@/lib/nav";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <UnstyledButton component={Link} href="/" aria-label="Lumen home">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="md"
          variant="gradient"
          gradient={{ from: "brand.5", to: "brand.7", deg: 135 }}
        >
          <IconSparkles size={24} aria-hidden />
        </ThemeIcon>
        {!compact && (
          <Text component="span" ff="heading" fw={800} fz={26}>
            Lumen
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}

function NavTree({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  if (collapsed) {
    return (
      <Stack align="center" gap="xs">
        {navGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Tooltip
                  key={item.href}
                  label={`${group.label}: ${item.label}`}
                  position="right"
                  withArrow
                >
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size={48}
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "sand.9"}
                    aria-label={`${group.label}: ${item.label}`}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <item.icon size={22} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={22} aria-hidden />}
          childrenOffset={28}
          defaultOpened
          fw={700}
        >
          {group.items.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} aria-hidden />}
                variant="filled"
                active={active}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                fw={600}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}

function Crumbs({ pathname }: { pathname: string }) {
  const current = findNav(pathname);
  if (!current) {
    return (
      <Text fz="sm" fw={600}>
        Lumen
      </Text>
    );
  }
  return (
    <Box component="nav" aria-label="Breadcrumb" miw={0}>
      <Breadcrumbs separator="/" separatorMargin="xs">
        <Text fz="sm" c="dimmed">
          {current.group.label}
        </Text>
        <Text fz="sm" fw={700} aria-current="page">
          {current.item.label}
        </Text>
      </Breadcrumbs>
    </Box>
  );
}

export function AppShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 76 }}
        navbar={{
          width: collapsed ? 100 : 300,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
        padding={{ base: "md", sm: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" miw={0}>
              <ActionIcon
                hiddenFrom="sm"
                size={48}
                variant="subtle"
                color="sand.9"
                aria-label="Open navigation menu"
                aria-haspopup="dialog"
                aria-expanded={drawerOpened}
                onClick={openDrawer}
              >
                <IconMenu2 size={24} aria-hidden />
              </ActionIcon>
              <ActionIcon
                visibleFrom="sm"
                size={48}
                variant="subtle"
                color="sand.9"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={24} aria-hidden />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={24} aria-hidden />
                )}
              </ActionIcon>
              <Crumbs pathname={pathname} />
            </Group>

            <Menu position="bottom-end" width={270}>
              <Menu.Target>
                <UnstyledButton aria-label={`Account menu for ${user.name}`}>
                  <Avatar color="brand" variant="filled" size={48} radius="xl">
                    {userInitials}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  {user.name}
                  <br />
                  {user.email}
                </Menu.Label>
                <Menu.Item
                  component={Link}
                  href="/projects"
                  py="sm"
                  leftSection={<IconFolders size={18} aria-hidden />}
                >
                  Your projects
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  href="/settings"
                  py="sm"
                  leftSection={<IconSettings size={18} aria-hidden />}
                >
                  Account settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar visibleFrom="sm" p="md" aria-label="Main navigation">
          <AppShell.Section mb="lg">
            <Group justify={collapsed ? "center" : "flex-start"}>
              <Brand compact={collapsed} />
            </Group>
          </AppShell.Section>

          <AppShell.Section grow style={{ overflowY: "auto" }}>
            <NavTree collapsed={collapsed} pathname={pathname} />
          </AppShell.Section>

          <AppShell.Section mt="md">
            <Divider mb="md" />
            {collapsed ? (
              <Group justify="center">
                <Tooltip label={`${user.name}, ${user.role}`} position="right" withArrow>
                  <Avatar color="brand" variant="light" size={48} radius="xl" aria-label={user.name}>
                    {userInitials}
                  </Avatar>
                </Tooltip>
              </Group>
            ) : (
              <Group gap="sm" wrap="nowrap">
                <Avatar color="brand" variant="light" size={48} radius="xl" aria-hidden>
                  {userInitials}
                </Avatar>
                <Box miw={0}>
                  <Text fw={700} truncate>
                    {user.name}
                  </Text>
                  <Text fz="sm" c="dimmed" truncate>
                    {user.role}
                  </Text>
                </Box>
              </Group>
            )}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main-content">
          <Container size="lg" px={0} py="md">
            {children}
          </Container>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        hiddenFrom="sm"
        size={320}
        padding="md"
        title={<Brand />}
        closeButtonProps={{ "aria-label": "Close navigation menu", size: "xl" }}
      >
        <Box component="nav" aria-label="Main navigation">
          <NavTree collapsed={false} pathname={pathname} onNavigate={closeDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
