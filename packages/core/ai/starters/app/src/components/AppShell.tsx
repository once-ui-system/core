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
  UserMenu,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { app, nav, navLinks, user } from "../resources/app";

/**
 * The signed-in frame: top bar, sidebar and a raised content panel. Only the
 * panel scrolls; the bar and sidebar stay put. Below `s` the sidebar hides and
 * the menu button opens the same nav in a left drawer. Edit src/resources/app.ts
 * for the name, user and nav; edit this file only to change the frame itself.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );
  // The drawer is open for the path it was opened on, so following a link in it
  // closes it with the navigation.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const group = nav.find(
    (entry) => "items" in entry && entry.items.some((l) => l.href === current),
  );
  const page = navLinks.find((link) => link.href === current);
  const crumbs = [
    { label: app.name, href: navLinks[0].href },
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
    icon: link.icon,
  }));

  const avatar = { value: initials(user.name), src: user.avatar || undefined };
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{user.name}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((entry) =>
        "items" in entry ? (
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

  return (
    <Column fill flex={1}>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-expanded={menuPath === pathname}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row minWidth={16} s={{ minWidth: 0 }}>
          {/* A brand-coloured letter tile until the product has a logo: then pass
              its SVG as `icon` (and drop `monogram`). Never draw one by hand. */}
          <Logo text={app.name} monogram size="s" href={navLinks[0].href} />
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} />
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
        {/* Name and email beside the avatar on desktop; the avatar alone on phones. */}
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
        <Column s={{ hide: true }} maxWidth={16} fitHeight position="sticky" top="56">
          {sideNav}
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column maxWidth="xl" paddingX="24" paddingY="32" fitHeight>
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
          {sideNav}
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
