"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Dropdown,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, product, user } from "@/lib/data";

const allHrefs = nav.flatMap((section) => section.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  return (
    <Nav fill paddingX="8" aria-label="Main" collapsed={collapsed} density="spacious">
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen
          selected={section.items.some((item) => item.href === current)}
        >
          {section.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              selected={item.href === current}
              aria-current={item.href === current ? "page" : undefined}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function trailFor(pathname: string) {
  const current = selectNavHref(pathname, allHrefs);
  for (const section of nav) {
    const leaf = section.items.find((item) => item.href === current);
    if (leaf) {
      return [{ label: section.label }, { label: leaf.label }];
    }
  }
  return [{ label: product }];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="12" as="header">
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
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <IconButton
            icon="grid"
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Heading as="span" textVariant="heading-strong-m" onBackground="brand-strong">
          {product}
        </Heading>
        <Row flex={1} paddingX="8" s={{ hide: true }}>
          <Breadcrumbs items={trailFor(pathname)} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
        <Dropdown
          placement="bottom-end"
          trigger={
            <Button variant="tertiary" size="m" aria-label="Account menu" suffixIcon="chevronDown">
              <Row gap="8" vertical="center">
                <Avatar size="s" value="MO" />
                <Row s={{ hide: true }}>{user.name}</Row>
              </Row>
            </Button>
          }
        >
          <Column padding="8" gap="4" minWidth={16}>
            <Option
              value="account"
              label={user.name}
              description={`${user.email} · ${user.role}`}
              prefix={<Avatar size="s" value="MO" />}
            />
            <Option value="settings" label="Settings" href="/settings" prefix={null} />
          </Column>
        </Dropdown>
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          maxWidth="18rem"
          fitHeight
          position="sticky"
          top="56"
          paddingY="8"
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
          >
            <Column maxWidth="xl" fillWidth gap="32" paddingX="24" paddingY="40" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={trailFor(pathname)} aria-label="Breadcrumb" />
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
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
