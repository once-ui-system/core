"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  DropdownWrapper,
  Icon,
  IconButton,
  Line,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  SmartLink,
  Text,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, user } from "@/lib/data";

const SHELL_ROUTES = nav.flatMap((section) => section.items.map((item) => item.href));
const allHrefs = SHELL_ROUTES;

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, allHrefs);

  if (collapsed) {
    return (
      <Column as="nav" aria-label="Main" horizontal="center" gap="12" paddingY="16">
        {nav.map((section, index) => (
          <Column key={section.key} horizontal="center" gap="8">
            {index > 0 && <Line width="32" />}
            {section.items.map((item) => {
              const name = `${section.label}: ${item.label}`;
              return (
                <IconButton
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  size="l"
                  variant={item.href === current ? "primary" : "ghost"}
                  tooltip={name}
                  tooltipPosition="right"
                  ariaLabel={name}
                />
              );
            })}
          </Column>
        ))}
      </Column>
    );
  }

  return (
    <Nav fill paddingX="8" paddingY="16" density="spacious" aria-label="Main">
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

export function LumenFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const menuOpen = menuPath === pathname;

  if (!SHELL_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const section = nav.find((s) => s.items.some((item) => item.href === pathname));
  const leaf = section?.items.find((item) => item.href === pathname);
  const crumbs = [
    { label: section?.label ?? "Lumen" },
    { label: leaf?.label ?? "" },
  ];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            ariaLabel="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <SmartLink href="/">
          <Row vertical="center" gap="8">
            <Icon name="sparkle" onBackground="brand-strong" />
            <Text variant="heading-strong-l" family="heading">
              Lumen
            </Text>
          </Row>
        </SmartLink>
        <Row flex={1} paddingLeft="16" vertical="center" overflow="hidden">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <DropdownWrapper
          placement="bottom-end"
          trigger={<IconButton icon="person" variant="tertiary" ariaLabel="Account menu" tooltip="Account" />}
          dropdown={
            <Column minWidth={16} padding="4" gap="2">
              <Column paddingX="12" paddingY="8" gap="4">
                <Text variant="label-strong-m">{user.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {user.email} · {user.role}
                </Text>
              </Column>
              <Line />
              <Option value="profile" label="Profile" href="/settings" />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "72" : 16}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            paddingX="l"
            background="surface"
          >
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="32" paddingY="40" fitHeight>
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
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
