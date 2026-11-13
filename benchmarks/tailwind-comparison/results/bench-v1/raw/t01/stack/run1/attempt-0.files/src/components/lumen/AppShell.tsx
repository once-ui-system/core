"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  type IconName,
  type KbarItem,
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
import { useCallback, useState, useSyncExternalStore } from "react";
import { isGroup, nav, navLinks, product, user } from "@/lib/data";

const STORAGE_KEY = "lumen:sidebar-collapsed";
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readCollapsed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // storage unavailable: nothing to persist
  }
  for (const listener of listeners) listener();
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** The icon of the group a link lives in, for the collapsed rail and the palette. */
function groupIconOf(href: string): IconName {
  for (const entry of nav) {
    if (isGroup(entry) && entry.items.some((l) => l.href === href)) return entry.icon;
  }
  return "home";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );

  // The server snapshot is always "expanded", so hydration matches.
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);
  const toggleCollapsed = useCallback(() => writeCollapsed(!readCollapsed()), []);

  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find((entry) => isGroup(entry) && entry.items.some((l) => l.href === current));
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = navLinks.map((link) => ({
    id: link.href,
    name: link.label,
    section: "Pages",
    shortcut: [],
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon ?? groupIconOf(link.href),
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
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  /** Full navigation: the expanded desktop sidebar and the phone drawer. */
  const fullNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((entry) =>
        isGroup(entry) ? (
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
              />
            ))}
          </NavGroup>
        ) : (
          <NavItem
            key={entry.href}
            href={entry.href}
            icon={entry.icon}
            label={entry.label}
            selected={entry.href === current}
          />
        ),
      )}
    </Nav>
  );

  /**
   * Collapsed rail: every destination stays reachable as an icon link whose
   * tooltip and accessible name are the group and the page.
   */
  const railNav = (
    <Nav fill padding="8" density="compact" aria-label="Main" horizontal="center" gap="4">
      {navLinks.map((link) => {
        const groupLabel = nav.find((e) => isGroup(e) && e.items.some((l) => l.href === link.href))
          ?.label;
        const name = groupLabel ? `${groupLabel}: ${link.label}` : link.label;
        return (
          <IconButton
            key={link.href}
            href={link.href}
            icon={link.icon ?? groupIconOf(link.href)}
            variant={link.href === current ? "secondary" : "ghost"}
            tooltip={name}
            tooltipPosition="right"
            aria-label={name}
            aria-current={link.href === current ? "page" : undefined}
          />
        );
      })}
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
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          />
        </Row>
        <Text variant="heading-strong-s">{product.name}</Text>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
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

      {/* On phones the header has no room for the trail, so it sits below. */}
      <Row hide s={{ hide: false }} paddingX="16" paddingBottom="8">
        <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? 4 : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          {collapsed ? railNav : fullNav}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" s={{ paddingX: "16" }} fitHeight>
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
          {fullNav}
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
