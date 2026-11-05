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
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { user } from "@/lib/data";
import { navGroups, navLinks } from "@/lib/nav";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function LumenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  // The drawer is open for the path it was opened on, so following a link in it closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useHotkeys("mod+k", () => setSearchOpen((open) => !open));

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: "Lumen", href: "/" },
    ...(page ? [{ label: page.group }, { label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: link.group,
    shortcut: [],
    keywords: `${link.label} ${link.group}`.toLowerCase(),
    href: link.href,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Line />
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  /** The same navigation for the sidebar (optionally collapsed) and the drawer. */
  const sideNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
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
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="48" fillWidth vertical="center" paddingX="12" gap="8">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            tooltip="Menu"
            ariaLabel="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row minWidth={8} s={{ minWidth: 0 }}>
          <Text as="span" variant="heading-strong-m" family="heading">
            Lumen
          </Text>
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false, flex: 1 }}>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {page?.label}
          </Text>
        </Row>
        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="48"
        >
          {sideNav(collapsed)}
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
            <Column maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "16" }} gap="20" fitHeight>
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
          {sideNav(false)}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
