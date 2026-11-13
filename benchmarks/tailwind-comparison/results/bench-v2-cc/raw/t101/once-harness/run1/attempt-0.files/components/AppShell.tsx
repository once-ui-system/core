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
  Logo,
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
import { product, user } from "../lib/data";
import { nav, navLinks } from "../lib/nav";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The signed-in frame shared by every screen: header with breadcrumb, a collapsible
 * sidebar on desktop and a drawer on phones. Only the content panel scrolls.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const section = nav.find((entry) => entry.items.some((link) => link.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(section ? [{ label: section.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    shortcut: [],
    keywords: link.label.toLowerCase(),
    href: link.href,
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
          selected={entry.items.some((link) => link.href === current)}
          defaultOpen={entry.items.some((link) => link.href === current)}
        >
          {entry.items.map((link) => (
            <NavItem
              key={link.href}
              href={link.href}
              label={link.label}
              selected={link.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );

  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

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
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row minWidth="14rem" s={{ hide: true }}>
          <Logo text={product.name} monogram size="s" href="/" />
        </Row>
        <Row flex={1} minWidth={0}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <Button
            size="s"
            variant="secondary"
            prefixIcon="search"
            label="Search"
            onClick={() => setSearchOpen(true)}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="search"
            variant="tertiary"
            tooltip="Search"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <ThemeSwitcher collapsed direction="column" />
        </Row>
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
        <Column
          id="sidebar"
          s={{ hide: true }}
          width={collapsed ? 56 : 224}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          <Row paddingX="8" paddingBottom="4" horizontal={collapsed ? "center" : "end"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={toggleLabel}
              tooltipPosition="right"
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              aria-controls="sidebar"
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
          {sideNav(collapsed)}
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            tabIndex={-1}
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="24" s={{ paddingX: "16" }} fitHeight>
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
