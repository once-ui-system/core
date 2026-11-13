"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Heading,
  Icon,
  IconButton,
  Kbar,
  type KbarItem,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  selectNavHref,
  Text,
  ThemeSwitcher,
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav, navLinks, product, user } from "../lib/data";

/**
 * The signed-in frame, mounted once in the root layout: header, sidebar and a raised
 * content panel. Only the panel scrolls. On desktop the sidebar collapses to icons;
 * below `s` it is replaced by a menu button that opens the same nav in a left drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(page ? [{ label: page.group }, { label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: link.group,
    shortcut: [],
    keywords: `${link.label} ${link.group}`.toLowerCase(),
    href: link.href,
    icon: link.icon,
  }));

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

  const sideNav = (isCollapsed: boolean) => (
    <Nav fill paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
      {nav.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen={entry.items.some((l) => l.href === current)}
        >
          {entry.items.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              selected={link.href === current}
              aria-current={link.href === current ? "page" : undefined}
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
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuPath === pathname}
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
          <Heading as="span" textVariant="heading-strong-l">
            {product.name}
          </Heading>
        </Row>
        <Row flex={1} paddingLeft="12" s={{ hide: true }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ flex: 1 }} />
        <Button
          size="s"
          variant="secondary"
          prefixIcon="search"
          label="Search"
          onClick={() => setSearchOpen(true)}
        />
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

      <Row fill paddingX="8">
        <Column s={{ hide: true }} fitHeight position="sticky" top="56">
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
              <Row hide s={{ hide: false }} paddingBottom="12">
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
              </Row>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuPath === pathname}
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

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
