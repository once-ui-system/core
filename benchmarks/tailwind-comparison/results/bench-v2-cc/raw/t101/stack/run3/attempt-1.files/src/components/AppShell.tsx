"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Column,
  Drawer,
  Heading,
  IconButton,
  Nav,
  NavGroup,
  NavItem,
  Option,
  Row,
  UserMenu,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { nav, user } from "@/lib/data";

const allHrefs = nav.flatMap((section) => section.items.map((item) => item.href));

function normalize(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  return (
    <Nav fill paddingX="8" density="compact" collapsed={collapsed} aria-label="Main">
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const rawPath = usePathname();
  const pathname = normalize(rawPath || "/");
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const section = nav.find((s) => s.items.some((item) => item.href === pathname));
  if (!section) {
    return <>{children}</>;
  }
  const page = section.items.find((item) => item.href === pathname);

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        height="56"
        fillWidth
        vertical="center"
        paddingX="16"
        gap="12"
        borderBottom
        background="surface"
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="s"
            ariaLabel="Open navigation"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }} minWidth="104">
          <Heading as="span" variant="heading-strong-l">
            Lumen
          </Heading>
        </Row>
        <Row flex={1} vertical="center" minWidth="0">
          <Breadcrumbs
            aria-label="Breadcrumb"
            items={[
              { label: "Lumen", href: "/" },
              { label: section.label },
              { label: page ? page.label : "" },
            ]}
          />
        </Row>
        <UserMenu
          name={user.name}
          subline={user.role}
          avatarProps={{ value: "MO", size: "s" }}
          placement="bottom-end"
          dropdown={
            <Column padding="4" gap="2" minWidth={12}>
              <Option value="profile" label={user.email} description="Signed in" disabled />
              <Option value="settings" label="Settings" href="/settings" />
              <Option value="signout" label="Sign out" />
            </Column>
          }
        />
      </Row>
      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={18} fitHeight position="sticky" top="56" gap="8" paddingY="8">
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
          <SideNav pathname={pathname} collapsed={collapsed} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column
              as="main"
              id="main"
              maxWidth="xl"
              fillWidth
              gap="24"
              paddingX="24"
              paddingY="24"
              s={{ paddingX: "16" }}
              fitHeight
            >
              {children}
            </Column>
          </Row>
        </Row>
      </Row>
      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}
