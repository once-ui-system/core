"use client";

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
  Text,
  UserMenu,
  Icon,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups, product, user } from "@/lib/data";

const SHELL_ROUTES = ["/", "/projects", "/settings"];
const MATCH_HREFS = ["/", "/projects", "/settings"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The signed-in frame for /, /projects and /settings. Mounted once from the
 * root layout, so the collapsed state and open groups survive navigation.
 * Any other route (auth, the template's /app pages) renders untouched.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  if (!SHELL_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  const current = selectNavHref(pathname, MATCH_HREFS);
  const menuOpen = menuPath === pathname;
  const group = navGroups.find((g) => g.items.some((i) => i.href === current));
  const page = group?.items.find((i) => i.href === current);
  const crumbs = [
    { label: product.name, href: "/" },
    ...(group ? [{ label: group.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const renderNav = (isCollapsed: boolean) => (
    <Nav density="compact" fill paddingX="8" collapsed={isCollapsed} aria-label="Main">
      {isCollapsed
        ? navGroups.flatMap((g) =>
            g.items.map((item) => (
              <NavItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                aria-label={`${g.label}: ${item.label}`}
                title={`${g.label}: ${item.label}`}
                selected={item.href === current}
              />
            )),
          )
        : navGroups.map((g) => (
            <NavGroup
              key={g.key}
              label={g.label}
              icon={g.icon}
              open={!!open[g.key]}
              onToggle={() => setOpen((state) => ({ ...state, [g.key]: !state[g.key] }))}
            >
              {g.items.map((item) => (
                <NavItem
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  selected={item.href === current}
                />
              ))}
            </NavGroup>
          ))}
    </Nav>
  );

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

  return (
    <Column fill flex={1}>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            ariaLabel="Open navigation menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Text variant="heading-strong-m" onBackground="brand-strong">
          {product.name}
        </Text>
        <Row flex={1} paddingLeft="16" s={{ paddingLeft: "0" }}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
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
        <Column
          s={{ hide: true }}
          width={collapsed ? "64" : undefined}
          minWidth={collapsed ? undefined : 16}
          maxWidth={collapsed ? undefined : 16}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          {renderNav(collapsed)}
          <Row paddingX="8" horizontal={collapsed ? "center" : "end"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="32" gap="24" fitHeight>
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
          {renderNav(false)}
        </Column>
      </Drawer>
    </Column>
  );
}
