"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbd,
  Nav,
  NavItem,
  Option,
  Row,
  Text,
  User,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { initials, navLinks, product, user } from "@/lib/data";
import { CommandPalette } from "./CommandPalette";
import { InviteDialog } from "./InviteDialog";
import { PaletteProvider, usePalette } from "./PaletteProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PaletteProvider>
      <Frame>{children}</Frame>
      <CommandPalette />
      <InviteDialog />
    </PaletteProvider>
  );
}

function SideNav({ current }: { current: string | null }) {
  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {navLinks.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          selected={link.href === current}
        />
      ))}
    </Nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { openPalette } = usePalette();
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [{ label: product.name, href: "/" }, { label: page ? page.label : "Dashboard" }];

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
            tooltip="Menu"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row minWidth="12rem" s={{ minWidth: 0 }} vertical="center" gap="8">
          <Icon name="bolt" onBackground="brand-strong" />
          <Text textVariant="heading-strong-s">{product.name}</Text>
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} />
        </Row>
        <Row s={{ flex: 1 }} />

        {/* Desktop: labelled button with the shortcut beside it. */}
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Button
            size="s"
            variant="secondary"
            prefixIcon="search"
            label="Search"
            aria-label="Open command palette"
            aria-haspopup="dialog"
            onClick={openPalette}
          />
          <Kbd keys="mod+k" />
        </Row>
        {/* Phones: icon button, still visible and tappable. */}
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="search"
            variant="secondary"
            tooltip="Search"
            aria-label="Open command palette"
            aria-haspopup="dialog"
            onClick={openPalette}
          />
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
        <Column s={{ hide: true }} maxWidth="16rem" fitHeight position="sticky" top="56">
          <SideNav current={current} />
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
          <SideNav current={current} />
        </Column>
      </Drawer>
    </Column>
  );
}
