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
import { useEffect, useState } from "react";
import { navGroups, navLinks, product, user } from "@/lib/data";

const COLLAPSE_KEY = "lumen:sidebar-collapsed";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // The shell mounts per route tree ("/" vs the (app) group), so the collapsed
  // preference is restored from sessionStorage after mount.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.sessionStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  };

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
  const page = navLinks.find((l) => l.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    keywords: link.label.toLowerCase(),
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

  const expandedNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {navGroups.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen
          selected={entry.items.some((l) => l.href === current)}
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

  // Collapsed rail: every destination stays reachable as an icon with a tooltip
  // and an accessible name that includes its group.
  const collapsedNav = (
    <Column as="nav" aria-label="Main" gap="4" paddingX="8" horizontal="center">
      {navGroups.map((entry, index) => (
        <Column
          key={entry.label}
          gap="2"
          horizontal="center"
          role="group"
          aria-label={entry.label}
        >
          {index > 0 ? (
            <Row height="1" width="24" background="neutral-alpha-weak" marginY="8" />
          ) : null}
          {entry.items.map((link) => (
            <IconButton
              key={link.href}
              href={link.href}
              icon={link.icon}
              variant={link.href === current ? "secondary" : "ghost"}
              tooltip={`${entry.label}: ${link.label}`}
              tooltipPosition="right"
              aria-label={`${entry.label}: ${link.label}`}
              aria-current={link.href === current ? "page" : undefined}
            />
          ))}
        </Column>
      ))}
    </Column>
  );

  const menuOpen = menuPath === pathname;

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
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text textVariant="heading-strong-s">{product.name}</Text>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
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
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          {collapsed ? collapsedNav : expandedNav}
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
              fillWidth
              maxWidth="xl"
              paddingX="24"
              paddingY="32"
              s={{ paddingX: "16", paddingY: "24" }}
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
          {expandedNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
