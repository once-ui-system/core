"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  type KbarItem,
  Kbd,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
  useHotkeys,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, product, routeTrail, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The route an href belongs to, without any fragment. */
const routeOf = (href: string) => href.split("#")[0] || "/";

/**
 * The one nav item that is current. "Reports" shares the /projects route with
 * "Projects" (it carries a #reports fragment), so only hrefs without a
 * fragment can own a route: that keeps exactly one item highlighted.
 */
function currentHref(pathname: string): string | null {
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.href.includes("#") && routeOf(item.href) === pathname) return item.href;
    }
  }
  return null;
}

const itemIcons: Record<string, IconName> = {
  Overview: "home",
  Reports: "document",
  Projects: "folder",
  Settings: "settings",
};

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = currentHref(pathname);

  if (collapsed) {
    // Icon rail: every item stays reachable, named by its group and label.
    return (
      <Column as="nav" aria-label="Main" fillWidth horizontal="center" gap="4" paddingY="4">
        {nav.map((group) =>
          group.items.map((item) => (
            <IconButton
              key={item.href}
              href={item.href}
              icon={itemIcons[item.label] ?? group.icon}
              variant={item.href === current ? "secondary" : "ghost"}
              tone={item.href === current ? "brand" : "neutral"}
              tooltip={`${group.label}: ${item.label}`}
              tooltipPosition="right"
              aria-label={`${group.label}: ${item.label}`}
              aria-current={item.href === current ? "page" : undefined}
            />
          )),
        )}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((group) => (
        <NavGroup
          key={group.label}
          label={group.label}
          icon={group.icon}
          defaultOpen
          selected={group.items.some((item) => item.href === current)}
        >
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              selected={item.href === current}
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
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const trail = routeTrail[pathname];
  const crumbs = [
    { label: product.name, href: "/" },
    ...(trail?.group ? [{ label: trail.group }] : []),
    ...(trail ? [{ label: trail.page }] : []),
  ];

  const commands: KbarItem[] = [
    { id: "overview", name: "Overview", section: "Analytics", href: "/", icon: "home" },
    { id: "projects", name: "Projects", section: "Workspace", href: "/projects", icon: "folder" },
    {
      id: "settings",
      name: "Settings",
      section: "Workspace",
      href: "/settings",
      icon: "settings",
    },
  ];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Open menu"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row vertical="center" gap="8">
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Text as="span" textVariant="heading-strong-s" family="heading">
            {product.name}
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }} paddingLeft="16">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
        <Row s={{ hide: true }}>
          <Kbd keys="mod+k" />
        </Row>
        <ThemeSwitcher collapsed direction="column" />
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
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
            fillWidth
            background="surface"
            border
          >
            <Column
              maxWidth="xl"
              fillWidth
              paddingX="24"
              paddingY="24"
              s={{ paddingX: "16" }}
              fitHeight
            >
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
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>

      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
