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
  Divider,
  Drawer,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBolt,
  IconBriefcase,
  IconChartBar,
  IconFolders,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";
import { initials, product, user } from "@/lib/data";

type IconType = typeof IconBolt;

interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

interface NavGroup {
  label: string;
  icon: IconType;
  items: NavItem[];
}

const NAV: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartBar,
    items: [
      { label: "Overview", href: "/", icon: IconLayoutDashboard },
      { label: "Reports", href: "/reports", icon: IconReport },
    ],
  },
  {
    label: "Workspace",
    icon: IconBriefcase,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

function crumbsFor(pathname: string): string[] {
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [group.label, item.label];
      }
    }
  }
  return [product];
}

function Brand() {
  return (
    <Group gap="xs" wrap="nowrap">
      <ThemeIcon size={28} aria-hidden>
        <IconBolt size={18} stroke={2} />
      </ThemeIcon>
      <Text ff="heading" fw={700} size="lg">
        {product}
      </Text>
    </Group>
  );
}

function NavList({
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
      <Stack gap="xs" align="center">
        {NAV.map((group, index) => (
          <Stack key={group.label} gap="xs" align="center" w="100%">
            {index > 0 && <Divider w="60%" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <ActionIcon
                    component={Link}
                    href={item.href}
                    size="lg"
                    variant={active ? "filled" : "subtle"}
                    color={active ? "brand" : "gray"}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon size={20} stroke={1.5} />
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
    <Stack gap={4}>
      {NAV.map((group) => (
        <NavLink
          key={group.label}
          label={group.label}
          leftSection={<group.icon size={18} stroke={1.5} />}
          defaultOpened
          childrenOffset={20}
          fw={600}
        >
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={18} stroke={1.5} />}
                active={active}
                variant="filled"
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              />
            );
          })}
        </NavLink>
      ))}
    </Stack>
  );
}

function UserBlock({ collapsed }: { collapsed: boolean }) {
  const avatar = (
    <Avatar color="brand" variant="light" aria-hidden>
      {initials(user.name)}
    </Avatar>
  );
  if (collapsed) {
    return (
      <Group justify="center">
        <Tooltip label={`${user.name}, ${user.role}`} position="right" withArrow>
          {avatar}
        </Tooltip>
      </Group>
    );
  }
  return (
    <Group wrap="nowrap" gap="sm">
      {avatar}
      <Box miw={0}>
        <Text size="sm" fw={600} truncate>
          {user.name}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {user.role} · {user.email}
        </Text>
      </Box>
    </Group>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const crumbs = crumbsFor(pathname);

  return (
    <>
      <AppShell
        padding="md"
        header={{ height: 56 }}
        navbar={{
          width: collapsed ? 72 : 264,
          breakpoint: "sm",
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" gap="md" wrap="nowrap">
            <Burger
              opened={drawerOpened}
              onClick={openDrawer}
              hiddenFrom="sm"
              size="sm"
              aria-label="Open navigation menu"
            />
            <Brand />
            <ActionIcon
              variant="subtle"
              color="gray"
              visibleFrom="sm"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar to icons"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
              ) : (
                <IconLayoutSidebarLeftCollapse size={20} stroke={1.5} />
              )}
            </ActionIcon>
            <Box component="nav" aria-label="Breadcrumb" miw={0} style={{ overflow: "hidden" }}>
              <Breadcrumbs separator="/" separatorMargin="xs">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <Text
                      key={crumb}
                      size="sm"
                      fw={last ? 600 : 400}
                      c={last ? undefined : "dimmed"}
                      aria-current={last ? "page" : undefined}
                      truncate
                    >
                      {crumb}
                    </Text>
                  );
                })}
              </Breadcrumbs>
            </Box>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" aria-label="Primary">
          <AppShell.Section grow component={ScrollArea}>
            <NavList pathname={pathname} collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section pt="md">
            <Divider mb="md" />
            <UserBlock collapsed={collapsed} />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<Brand />}
        size="xs"
        hiddenFrom="sm"
      >
        <Stack justify="space-between" mih="calc(100dvh - 120px)">
          <Box component="nav" aria-label="Primary">
            <NavList pathname={pathname} collapsed={false} onNavigate={closeDrawer} />
          </Box>
          <Box>
            <Divider mb="md" />
            <UserBlock collapsed={false} />
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
