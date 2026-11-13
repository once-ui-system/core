"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Anchor,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Divider,
  Drawer,
  Group,
  Menu,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBriefcase,
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { findCrumbs, navGroups, user } from "@/lib/data";

const itemIcons: Record<string, ReactNode> = {
  "/": <IconLayoutDashboard size={16} stroke={1.6} />,
  "/reports": <IconReport size={16} stroke={1.6} />,
  "/projects": <IconFolders size={16} stroke={1.6} />,
  "/settings": <IconSettings size={16} stroke={1.6} />,
};

const groupIcons: Record<string, ReactNode> = {
  Analytics: <IconChartBar size={16} stroke={1.6} />,
  Workspace: <IconBriefcase size={16} stroke={1.6} />,
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavContent({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  if (collapsed) {
    return (
      <Stack gap={4} align="center" component="nav" aria-label="Primary">
        {navGroups.map((group, i) => (
          <Stack key={group.label} gap={4} align="center" w="100%">
            {i > 0 && <Divider w="70%" />}
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Tooltip key={item.href} label={`${group.label}: ${item.label}`} position="right">
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "lumen" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                  >
                    {itemIcons[item.href]}
                  </ActionIcon>
                </Tooltip>
              );
            })}
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Box component="nav" aria-label="Primary">
      {navGroups.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={groupIcons[group.label]}
          defaultOpened
          childrenOffset={14}
          fw={600}
          py={6}
        >
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={itemIcons[item.href]}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                py={6}
                fw={500}
              />
            );
          })}
        </NavLink>
      ))}
    </Box>
  );
}

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, drawer] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = findCrumbs(pathname);

  const crumbItems = crumbs
    ? [
        <Text key="root" size="sm" c="dimmed">
          {crumbs.group}
        </Text>,
        <Text key="leaf" size="sm" fw={600} aria-current="page">
          {crumbs.label}
        </Text>,
      ]
    : [
        <Anchor key="home" component={Link} href="/" size="sm">
          Lumen
        </Anchor>,
      ];

  return (
    <AppShell
      header={{ height: 44 }}
      navbar={{
        width: collapsed ? 52 : 224,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="sm" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
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
              ff="heading"
              fw={700}
              fz="lg"
              c="lumen.7"
              underline="never"
              aria-label="Lumen home"
            >
              Lumen
            </Anchor>
            <Divider orientation="vertical" visibleFrom="xs" />
            <Breadcrumbs separator="/" visibleFrom="xs" aria-label="Breadcrumb">
              {crumbItems}
            </Breadcrumbs>
          </Group>
          <Menu position="bottom-end" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" aria-label="Account menu">
                <Avatar size={26} radius="xl" color="lumen" name={user.name} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>
                {user.name}
                <Text size="xs" c="dimmed" fw={400}>
                  {user.email}
                </Text>
              </Menu.Label>
              <Menu.Item component={Link} href="/settings" leftSection={<IconSettings size={14} />}>
                Settings
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <NavContent pathname={pathname} collapsed={collapsed} />
        </AppShell.Section>
        <AppShell.Section>
          <Divider mb="xs" />
          <Group justify={collapsed ? "center" : "flex-end"}>
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={18} stroke={1.6} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={18} stroke={1.6} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </AppShell.Section>
      </AppShell.Navbar>

      <Drawer
        opened={drawerOpened}
        onClose={drawer.close}
        hiddenFrom="sm"
        size={260}
        padding="xs"
        title="Lumen"
        closeButtonProps={{ "aria-label": "Close navigation menu" }}
      >
        <NavContent pathname={pathname} collapsed={false} onNavigate={drawer.close} />
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
