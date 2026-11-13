"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Breadcrumbs,
  Burger,
  Divider,
  Drawer,
  Group,
  NavLink,
  Anchor,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconChartBar,
  IconChevronsLeft,
  IconChevronsRight,
  IconFileAnalytics,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";
import { user } from "@/lib/data";

interface NavItem {
  label: string;
  href: string;
  icon: Icon;
}

interface NavGroup {
  label: string;
  icon: Icon;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: "Analytics",
    icon: IconChartBar,
    items: [
      { label: "Overview", href: "/", icon: IconLayoutDashboard },
      { label: "Reports", href: "/reports", icon: IconFileAnalytics },
    ],
  },
  {
    label: "Workspace",
    icon: IconFolders,
    items: [
      { label: "Projects", href: "/projects", icon: IconFolders },
      { label: "Settings", href: "/settings", icon: IconSettings },
    ],
  },
];

function Navigation({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  if (collapsed) {
    return (
      <nav aria-label="Main">
        {groups.map((group, index) => (
          <div key={group.label}>
            {index > 0 && <Divider my="xs" />}
            {group.items.map((item) => {
              const active = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <Tooltip key={item.href} label={item.label} position="right" withArrow>
                  <NavLink
                    component={Link}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    active={active}
                    variant="filled"
                    leftSection={<ItemIcon size={18} aria-hidden />}
                    onClick={onNavigate}
                    styles={{ root: { justifyContent: "center", padding: 8 }, section: { margin: 0 } }}
                  />
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Main">
      {groups.map((group) => {
        const GroupIcon = group.icon;
        const groupActive = group.items.some((item) => item.href === pathname);
        return (
          <NavLink
            key={group.label}
            label={group.label}
            leftSection={<GroupIcon size={16} aria-hidden />}
            defaultOpened
            childrenOffset={16}
            fw={600}
            data-group-active={groupActive || undefined}
          >
            {group.items.map((item) => {
              const active = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  aria-current={active ? "page" : undefined}
                  active={active}
                  variant="filled"
                  fw={400}
                  leftSection={<ItemIcon size={16} aria-hidden />}
                  onClick={onNavigate}
                />
              );
            })}
          </NavLink>
        );
      })}
    </nav>
  );
}

function crumbsFor(pathname: string): { label: string; href?: string }[] {
  for (const group of groups) {
    for (const item of group.items) {
      if (item.href === pathname) {
        return [{ label: "Lumen", href: "/" }, { label: group.label }, { label: item.label }];
      }
    }
  }
  return [{ label: "Lumen", href: "/" }];
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>({
    key: "lumen-nav-collapsed",
    defaultValue: false,
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  const crumbs = crumbsFor(pathname);

  return (
    <>
      <AppShell
        header={{ height: 44 }}
        navbar={{ width: collapsed ? 52 : 224, breakpoint: "sm", collapsed: { mobile: true } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="sm" justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation menu"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                visibleFrom="sm"
                onClick={() => setCollapsed((value) => !value)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
              >
                {collapsed ? <IconChevronsRight size={16} /> : <IconChevronsLeft size={16} />}
              </ActionIcon>
              <Breadcrumbs separatorMargin={6} aria-label="Breadcrumb" style={{ flexWrap: "nowrap" }}>
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  if (crumb.href && !last) {
                    return (
                      <Anchor key={crumb.label} component={Link} href={crumb.href} fz="sm">
                        {crumb.label}
                      </Anchor>
                    );
                  }
                  return (
                    <Text
                      key={crumb.label}
                      fz="sm"
                      fw={last ? 600 : 400}
                      c={last ? undefined : "dimmed"}
                      aria-current={last ? "page" : undefined}
                    >
                      {crumb.label}
                    </Text>
                  );
                })}
              </Breadcrumbs>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text fz="sm" visibleFrom="xs">
                {user.name}
              </Text>
              <Avatar size={24} color="lumen" aria-label={user.name}>
                MO
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="xs">
          <Navigation collapsed={collapsed} />
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        hiddenFrom="sm"
        size={260}
        padding="xs"
        title="Lumen"
        styles={{ title: { fontFamily: "var(--mantine-font-family-headings)", fontWeight: 600 } }}
      >
        <Navigation collapsed={false} onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}
