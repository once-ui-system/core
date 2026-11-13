"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  DropdownWrapper,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  Text,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
  type IconName,
} from "@once-ui-system/core";
import { user } from "@/lib/data";

type NavLeaf = { href: string; label: string };
type NavSection = { key: string; label: string; icon: IconName; items: NavLeaf[] };

const nav: NavSection[] = [
  {
    key: "analytics",
    label: "Analytics",
    icon: "barChart",
    items: [
      { href: "/", label: "Overview" },
      { href: "/reports", label: "Reports" },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: "organization",
    items: [
      { href: "/projects", label: "Projects" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

const hrefs = nav.flatMap((s) => s.items.map((i) => i.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, hrefs);
  return (
    <Nav fill paddingX="8" aria-label="Main" density="spacious" collapsed={collapsed}>
      {nav.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          defaultOpen={section.items.some((i) => i.href === current)}
        >
          {section.items.map((item) => (
            <NavItem key={item.href} href={item.href} label={item.label} selected={item.href === current} />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function crumbs(pathname: string) {
  for (const section of nav) {
    const item = section.items.find((i) => i.href === pathname);
    if (item) {
      return [{ label: section.label }, { label: item.label, href: item.href }];
    }
  }
  return [{ label: "Lumen" }];
}

/**
 * The signed-in shell, mounted once in the root layout so open groups and the
 * collapsed state survive navigation. Other routes (auth, invites) pass through.
 */
export function LumenShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  if (!hrefs.includes(pathname)) {
    return <>{children}</>;
  }

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
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          />
        </Row>
        <Heading as="span" variant="heading-strong-m" onBackground="brand-strong">
          Lumen
        </Heading>
        <Row flex={1} paddingLeft="16" s={{ hide: true }}>
          <Breadcrumbs items={crumbs(pathname)} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} hide s={{ hide: false }} />
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column minWidth={12} padding="4" gap="4">
              <Option value="email" label={user.email} disabled />
              <Option value="profile" label="Profile" href="/settings" />
              <Option value="settings" label="Settings" href="/settings" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column
          as="aside"
          s={{ hide: true }}
          width={collapsed ? "72" : undefined}
          maxWidth={collapsed ? "72" : 18}
          fitHeight
          position="sticky"
          top="56"
        >
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row height="below-header" overflowY="auto" topRadius="l" horizontal="center" fillWidth background="surface">
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="32" padding="24" paddingY="40" fitHeight>
              <Row hide s={{ hide: false }}>
                <Breadcrumbs items={crumbs(pathname)} aria-label="Breadcrumb" />
              </Row>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}
