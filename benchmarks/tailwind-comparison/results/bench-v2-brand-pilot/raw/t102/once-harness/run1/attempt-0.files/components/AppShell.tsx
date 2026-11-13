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
  selectNavHref,
  useHotkeys,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, navLinks, product, user } from "../lib/data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Routes that exist. "Reports" shares the dashboard route, so it never wins the highlight.
const routeLinks = navLinks.filter((link) => !link.href.includes("#"));

type SideNavProps = {
  current: string | null;
  collapsed: boolean;
};

function SideNav({ current, collapsed }: SideNavProps) {
  if (collapsed) {
    // Icon rail: every item stays reachable, named by aria-label and a tooltip.
    return (
      <Nav fill paddingX="8" aria-label="Main" gap="4">
        {navGroups.map((group) => (
          <Column key={group.label} gap="4" role="group" aria-label={group.label}>
            {group.items.map((link) => (
              <NavItem
                key={link.id}
                href={link.href}
                icon={link.icon}
                label={<VisuallyHidden>{`${group.label}: ${link.label}`}</VisuallyHidden>}
                aria-label={`${group.label}: ${link.label}`}
                title={`${group.label} · ${link.label}`}
                selected={link.href === current}
              />
            ))}
          </Column>
        ))}
      </Nav>
    );
  }

  return (
    <Nav fill paddingX="8" aria-label="Main">
      {navGroups.map((group) => (
        <NavGroup key={group.label} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((link) => (
            <NavItem
              key={link.id}
              href={link.href}
              label={link.label}
              selected={link.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

/**
 * The signed-in frame, mounted once in app/layout.tsx. Only the content pane
 * scrolls; the header and sidebar stay put. Below `s` the sidebar is replaced
 * by a menu button that opens the same nav in a left Drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    routeLinks.map((link) => link.href),
  );

  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuOpen = menuPath === pathname;

  useHotkeys("mod+k", () => setSearchOpen((open) => !open), { allowWhileTyping: true });

  const group = navGroups.find((g) => g.items.some((l) => l.href === current));
  const page = routeLinks.find((l) => l.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const commands: KbarItem[] = routeLinks.map((link) => ({
    id: link.id,
    name: link.label,
    section: "Go to",
    keywords: link.label.toLowerCase(),
    href: link.href,
    icon: link.icon,
  }));

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="8" gap="4" minWidth="14rem">
      <Column paddingX="12" paddingY="8" gap="2">
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
        {/* Phones: menu button opens the drawer. */}
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

        {/* Desktop: collapse toggle, then the brand. */}
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
          <Icon name="sparkle" onBackground="brand-strong" />
          <Text textVariant="heading-strong-m" family="heading">
            {product.name}
          </Text>
        </Row>

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

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "5rem" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          transition="macro-short"
        >
          <SideNav current={current} collapsed={collapsed} />
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
            <Column maxWidth="xl" paddingX="24" paddingY="40" fitHeight>
              {/* Phones show the trail inside the page, since the header has no room. */}
              <Row hide s={{ hide: false }} paddingBottom="16">
                <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
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
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <SideNav current={current} collapsed={false} />
        </Column>
      </Drawer>
      <Kbar items={commands} open={searchOpen} onOpenChange={setSearchOpen} />
    </Column>
  );
}
