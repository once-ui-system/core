"use client";

import {
  Avatar,
  Column,
  Drawer,
  IconButton,
  Line,
  Logo,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  Breadcrumbs,
  Icon,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { crumbs, navGroups, product, user } from "@/lib/data";

function normalize(pathname: string): string {
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/settings")) return "/settings";
  return "/";
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  // Match on plain paths: the Reports entry carries a query string that
  // would never prefix a pathname.
  const hrefs = navGroups.flatMap((g) => g.items.map((i) => i.href.split("?")[0]));
  const current = selectNavHref(pathname, hrefs);
  const route = normalize(pathname);

  return (
    <Nav
      fill
      density="compact"
      collapsed={collapsed}
      aria-label="Main"
      paddingX="8"
      overflowY="auto"
    >
      {navGroups.map((group) => {
        const holdsCurrent = group.items.some((i) => i.href.split("?")[0] === current);
        return (
          <NavGroup
            key={group.key}
            label={group.label}
            icon={group.icon}
            defaultOpen={holdsCurrent}
          >
            {group.items.map((item) => {
              const path = item.href.split("?")[0];
              // "Reports" shares the /projects path with "Projects"; only the
              // plain-path entry is the highlighted one.
              const selected = path === current && path === route && !item.href.includes("?");
              return (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  selected={selected}
                  aria-current={selected ? "page" : undefined}
                />
              );
            })}
          </NavGroup>
        );
      })}
    </Nav>
  );
}

function Account() {
  return (
    <UserMenu
      name={user.name}
      subline={user.role}
      avatarProps={{ value: user.name.charAt(0) }}
      dropdown={
        <Column minWidth={14} padding="4" gap="2">
          <Column paddingX="12" paddingY="8" gap="2">
            <Text variant="label-default-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.email}
            </Text>
          </Column>
          <Line marginY="4" />
          <Option
            value="settings"
            label="Settings"
            href="/settings"
            prefix={<Icon name="settings" size="xs" onBackground="neutral-weak" />}
          />
        </Column>
      }
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const crumb = crumbs[normalize(pathname)];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row
        as="header"
        fillWidth
        minHeight="56"
        paddingX="16"
        gap="12"
        vertical="center"
        horizontal="between"
        background="page"
        position="sticky"
        top="0"
        zIndex={1}
      >
        <Row gap="12" vertical="center">
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
          <Row gap="8" vertical="center">
            <Icon name="sparkle" size="s" onBackground="brand-medium" />
            <Text variant="heading-strong-s">{product.name}</Text>
          </Row>
          <Row s={{ hide: true }} paddingLeft="16">
            <Breadcrumbs
              aria-label="Breadcrumb"
              items={[{ label: crumb.section }, { label: crumb.page }]}
            />
          </Row>
        </Row>
        <Account />
      </Row>

      <Row hide s={{ hide: false }} fillWidth paddingX="16" paddingBottom="8">
        <Breadcrumbs
          aria-label="Breadcrumb"
          items={[{ label: crumb.section }, { label: crumb.page }]}
        />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 5 : 18}
          minWidth={collapsed ? 5 : 18}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
          <Row paddingX="8" paddingBottom="16" horizontal={collapsed ? "center" : "start"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            />
          </Row>
        </Column>

        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            paddingX="l"
            s={{ paddingX: "16" }}
            fillWidth
            background="surface"
          >
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16" fillWidth>
          <Row paddingX="16" paddingBottom="12" gap="12" vertical="center">
            <Avatar size="s" value={user.name.charAt(0)} />
            <Column>
              <Text variant="label-default-s">{user.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {user.email}
              </Text>
            </Column>
          </Row>
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
