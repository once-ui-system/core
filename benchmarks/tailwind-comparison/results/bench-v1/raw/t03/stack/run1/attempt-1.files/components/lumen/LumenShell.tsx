"use client";

import {
  Avatar,
  Button,
  Column,
  Drawer,
  IconButton,
  Kbd,
  Nav,
  NavItem,
  Row,
  Text,
  selectNavHref,
  useHotkeys,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, product, user } from "@/lib/data";
import { CommandPalette } from "./CommandPalette";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { InviteDialog } from "./InviteDialog";
import { LumenProvider, useLumen } from "./LumenProvider";

function SideNav({ pathname }: { pathname: string }) {
  const current = selectNavHref(
    pathname,
    nav.map((item) => item.href),
  );
  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          selected={item.href === current}
        />
      ))}
    </Nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { openPalette, paletteOpen, setPaletteOpen } = useLumen();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
  }, []);

  // "mod" is Cmd on a Mac and Ctrl elsewhere. allowWhileTyping so it also
  // works (and toggles closed) from inside a field.
  useHotkeys("mod+k", () => setPaletteOpen(!paletteOpen), {
    allowWhileTyping: true,
    preventDefault: true,
  });

  const shortcut = isMac ? "⌘K" : "Ctrl K";

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
            ariaLabel="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row gap="8" vertical="center" minWidth={10} s={{ minWidth: 0 }}>
          <Text variant="heading-strong-m">{product.name}</Text>
        </Row>
        <Row flex={1} horizontal="center">
          <Button
            variant="secondary"
            size="s"
            prefixIcon="search"
            onClick={openPalette}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            data-border="rounded"
          >
            <Row gap="12" vertical="center">
              <Text variant="label-default-s">Search</Text>
              <Row s={{ hide: true }}>
                <Kbd>{shortcut}</Kbd>
              </Row>
            </Row>
          </Button>
        </Row>
        <Row gap="8" vertical="center">
          <Column s={{ hide: true }} horizontal="end">
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar size="s" value="MO" />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={16} fitHeight position="sticky" top="56">
          <SideNav pathname={pathname} />
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
              maxWidth="l"
              fillWidth
              paddingX="24"
              paddingY="32"
              gap="32"
              fitHeight
              s={{ paddingX: "16" }}
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
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>

      <CommandPalette />
      <InviteDialog />
      <CreateProjectDialog />
    </Column>
  );
}

export function LumenShell({ children }: { children: React.ReactNode }) {
  return (
    <LumenProvider>
      <Frame>{children}</Frame>
    </LumenProvider>
  );
}
