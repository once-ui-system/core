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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, product, routeGroups, routeTitles, user } from "@/lib/data";

type SideNavProps = {
  pathname: string;
  collapsed?: boolean;
};

const allHrefs = navGroups.flatMap((group) => group.items.map((item) => item.href));

function SideNav({ pathname, collapsed = false }: SideNavProps) {
  // "/#reports" shares its path with "/", so only real routes take part in
  // the current-page match; a hash link never claims the highlight.
  const routeHrefs = allHrefs.filter((href) => !href.includes("#"));
  const current = selectNavHref(pathname, routeHrefs);

  return (
    <Nav density="compact" fill padding="4" collapsed={collapsed} aria-label="Main">
      {navGroups.map((group) => (
        <NavGroup
          key={group.key}
          label={group.label}
          icon={group.icon}
          defaultOpen={group.items.some((item) => item.href === current)}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              selected={item.href === current}
              aria-current={item.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link in it
  // closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const title = routeTitles[pathname] ?? "Lumen";
  const group = routeGroups[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group }] : []),
    { label: title },
  ];

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
        paddingX="16"
        gap="12"
        horizontal="between"
        background="page"
      >
        <Row vertical="center" gap="12" flex={1}>
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
          <Row vertical="center" gap="8">
            <Icon name="sparkle" size="s" onBackground="brand-medium" />
            <Text variant="heading-strong-s">{product.name}</Text>
          </Row>
          <Row s={{ hide: true }} paddingLeft="16">
            <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
          </Row>
        </Row>

        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO" }}
          dropdown={
            <Column minWidth={14} padding="4" gap="2">
              <Column paddingX="12" paddingY="8" gap="2">
                <Text variant="label-strong-s">{user.name}</Text>
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

      {/* Breadcrumb on phones sits under the header, where there is room. */}
      <Row hide s={{ hide: false }} fillWidth paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 4 : 16}
          width={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            paddingX="l"
            s={{ paddingX: "16" }}
            fillWidth
            background="surface"
          >
            <Column maxWidth="xl" fillWidth gap="m" paddingY="32" fitHeight>
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
        <Column paddingTop="64" paddingBottom="16" paddingX="8" gap="16">
          <Row gap="12" vertical="center" paddingX="8">
            <Avatar size="m" value="MO" />
            <Column>
              <Text variant="label-strong-s">{user.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {user.email}
              </Text>
            </Column>
          </Row>
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
