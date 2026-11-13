"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  SmartLink,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, shellPaths, user } from "@/lib/data";

function SideNav({ current, collapsed }: { current: string | null; collapsed?: boolean }) {
  return (
    <Nav fill paddingX="8" density="compact" collapsed={collapsed} aria-label="Main">
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen={section.items.some((item) => item.href === current)}
        >
          {section.items.map((item) => (
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
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  if (!shellPaths.includes(pathname)) {
    return <>{children}</>;
  }

  const current = selectNavHref(pathname, shellPaths);
  const section = nav.find((s) => s.items.some((item) => item.href === current));
  const leaf = section?.items.find((item) => item.href === current);
  const crumbs = [
    { label: section?.label ?? "Lumen" },
    { label: leaf?.label ?? "Overview" },
  ];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            tooltip="Menu"
            ariaLabel="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            size="s"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <SmartLink href="/">
          <Text as="span" variant="heading-strong-m" onBackground="brand-strong">
            Lumen
          </Text>
        </SmartLink>
        <Row s={{ hide: true }} paddingLeft="16" flex={1}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false }} flex={1}>
          <Text variant="label-default-s" onBackground="neutral-weak">
            {leaf?.label}
          </Text>
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column minWidth={12} padding="4" gap="2">
              <Option value="profile" label={user.email} description="Signed in" disabled />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "64" : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav current={current} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            paddingX="16"
            background="surface"
          >
            <Column as="main" id="main" fillWidth maxWidth="xl" gap="24" paddingY="24" fitHeight>
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
