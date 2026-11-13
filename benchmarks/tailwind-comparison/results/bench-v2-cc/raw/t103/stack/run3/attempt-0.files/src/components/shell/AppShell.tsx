"use client";

import {
  Avatar,
  Breadcrumbs,
  Column,
  Drawer,
  Icon,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { user } from "@/lib/data";

type NavLeaf = { label: string; href?: string; icon: IconName };
type NavGroupDef = { key: string; label: string; icon: IconName; items: NavLeaf[] };

const navigation: NavGroupDef[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/", icon: "trend" },
      // Reports has no screen yet, so it is a placeholder without a link.
      { label: "Reports", icon: "document" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { label: "Projects", href: "/projects", icon: "folder" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

const routes: Record<string, { group: string; label: string }> = {
  "/": { group: "Analytics", label: "Overview" },
  "/projects": { group: "Workspace", label: "Projects" },
  "/settings": { group: "Workspace", label: "Settings" },
};

const hrefs = navigation.flatMap((group) =>
  group.items.flatMap((item) => (item.href ? [item.href] : [])),
);

function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Nav density="compact" fill padding="4" collapsed={collapsed} aria-label="Main">
      {navigation.map((group) => (
        <NavGroup
          key={group.key}
          label={group.label}
          icon={group.icon}
          open={collapsed ? true : !!open[group.key]}
          onToggle={() => setOpen((state) => ({ ...state, [group.key]: !state[group.key] }))}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.label}
              href={item.href}
              label={item.label}
              icon={collapsed ? item.icon : undefined}
              selected={item.href !== undefined && item.href === current}
              aria-current={item.href !== undefined && item.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const rawPath = usePathname() ?? "/";
  const pathname = normalize(rawPath);
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    try {
      if (window.localStorage.getItem("lumen-sidebar") === "collapsed") setCollapsed(true);
    } catch {
      // storage unavailable: the sidebar simply starts expanded
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem("lumen-sidebar", next ? "collapsed" : "expanded");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const route = routes[pathname];
  if (!route) return <>{children}</>;

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        minHeight="56"
        position="sticky"
        top="0"
        background="page"
        vertical="center"
        paddingX="16"
        gap="8"
        zIndex={1}
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            ariaLabel="Open navigation menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text variant="heading-strong-m" onBackground="brand-strong">
          Lumen
        </Text>
        <Row fillWidth paddingLeft="16" vertical="center" overflow="hidden">
          <Breadcrumbs
            aria-label="Breadcrumb"
            items={[{ label: route.group }, { label: route.label }]}
          />
        </Row>
        <UserMenu
          name={user.name}
          avatarProps={{ value: "M" }}
          dropdown={
            <Column minWidth={14}>
              <Column fillWidth paddingX="12" paddingY="12" gap="2">
                <Text variant="heading-strong-s">{user.name}</Text>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {user.email}
                </Text>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  {user.role}
                </Text>
              </Column>
              <Line />
              <Column fillWidth padding="4" gap="2">
                <Option
                  prefix={<Icon onBackground="neutral-weak" size="s" name="settings" />}
                  label="Settings"
                  value="settings"
                  href="/settings"
                />
                <Option
                  prefix={<Icon onBackground="neutral-weak" size="s" name="folder" />}
                  label="Projects"
                  value="projects"
                  href="/projects"
                />
              </Column>
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            paddingX="l"
            background="surface"
          >
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16" fillWidth>
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
