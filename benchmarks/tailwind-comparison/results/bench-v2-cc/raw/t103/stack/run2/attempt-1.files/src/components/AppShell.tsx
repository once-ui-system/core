"use client";

import {
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, shellRoutes, user } from "@/lib/data";

const hrefs = nav.flatMap((group) => group.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  return (
    <Nav
      density="compact"
      fill
      overflowY="auto"
      padding="4"
      aria-label="Main"
      collapsed={collapsed}
    >
      {nav.map((group) => (
        <NavGroup key={group.key} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={collapsed ? item.icon : undefined}
              selected={item.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function crumbsFor(pathname: string) {
  for (const group of nav) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return [{ label: group.label }, { label: item.label }];
  }
  return [{ label: "Lumen" }];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const raw = usePathname() ?? "/";
  const pathname = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);

  if (!shellRoutes.includes(pathname)) return <>{children}</>;

  const menuOpen = menuPath === pathname;
  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("");

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        height="56"
        fillWidth
        vertical="center"
        horizontal="between"
        paddingX="16"
        gap="8"
        background="page"
        position="sticky"
        top="0"
        zIndex={1}
      >
        <Row vertical="center" gap="8" flex={1}>
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              ariaLabel="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuPath(pathname)}
            />
          </Row>
          <Row s={{ hide: true }}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
          <Text
            as="span"
            variant="heading-strong-m"
            onBackground="brand-strong"
            style={{ letterSpacing: "0.04em" }}
          >
            LUMEN
          </Text>
          <Row s={{ hide: true }} marginLeft="16">
            <Line vert height="16" />
          </Row>
          <Row s={{ hide: true }} marginLeft="8">
            <Breadcrumbs items={crumbsFor(pathname)} aria-label="Breadcrumb" />
          </Row>
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: initials }}
          dropdown={
            <Column minWidth={14} padding="4" gap="2">
              <Column paddingX="12" paddingY="8">
                <Text variant="label-strong-s">{user.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {user.email}
                </Text>
              </Column>
              <Line />
              <Option
                value="settings"
                label="Settings"
                href="/settings"
                prefix={<Icon name="settings" size="xs" onBackground="neutral-weak" />}
              />
              <Option
                value="projects"
                label="Projects"
                href="/projects"
                prefix={<Icon name="folder" size="xs" onBackground="neutral-weak" />}
              />
            </Column>
          }
        />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 4.5 : 16}
          minWidth={collapsed ? 4.5 : 16}
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
            background="surface"
            paddingX="l"
            s={{ paddingX: "16" }}
          >
            <Column as="main" id="main" fillWidth maxWidth="xl" gap="24" paddingY="32" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbsFor(pathname)} aria-label="Breadcrumb" />
              </Row>
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
        title="Navigation menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16" paddingX="8">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
