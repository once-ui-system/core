"use client";

import {
  Avatar,
  Breadcrumbs,
  Column,
  Drawer,
  Heading,
  Icon,
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navSections, product, user } from "@/lib/data";

const allHrefs = navSections.flatMap((section) => section.items.map((item) => item.href));

function SideNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  const current = selectNavHref(pathname, allHrefs);
  const [open, setOpen] = useState<Record<string, boolean>>({ analytics: true, workspace: true });

  return (
    <Nav density="compact" collapsed={collapsed} expandedWidth={14} aria-label="Main">
      {navSections.map((section) => (
        <NavGroup
          key={section.key}
          label={section.label}
          icon={section.icon}
          open={open[section.key]}
          onToggle={() => setOpen((state) => ({ ...state, [section.key]: !state[section.key] }))}
        >
          {section.items.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              selected={item.href === current}
            />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
}

function Shell({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const section = navSections.find((s) => s.items.some((i) => i.href === pathname));
  const leaf = section?.items.find((i) => i.href === pathname);
  const crumbs = [{ label: section?.label ?? "" }, { label: leaf?.label ?? "" }];

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
            ariaLabel="Open navigation menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row vertical="center" gap="8" s={{ hide: true }}>
          <Icon name="sparkle" size="s" onBackground="brand-strong" />
          <Heading as="span" variant="heading-strong-m">
            {product.name}
          </Heading>
        </Row>
        <Row s={{ hide: true }} vertical="center" paddingLeft="16">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row hide s={{ hide: false }} flex={1} vertical="center">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row flex={1} s={{ hide: true }} />
        <Row s={{ hide: true }}>
          <UserMenu
            name={user.name}
            subline={user.email}
            avatarProps={{ value: "MO" }}
            placement="bottom-end"
            dropdown={
              <Column minWidth={14} padding="4">
                <Option value="account" label={user.name} description={`${user.email} · ${user.role}`} disabled />
              </Column>
            }
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <Avatar value="MO" size="s" />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column as="aside" s={{ hide: true }} fitHeight position="sticky" top="56" paddingBottom="8" gap="4">
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
        <Row fill horizontal="center" topRadius="m" overflow="hidden">
          <Row height="below-header" overflowY="auto" topRadius="m" horizontal="center" fillWidth background="surface">
            <Column as="main" id="main" maxWidth="xl" fillWidth gap="16" paddingX="16" paddingY="24" fitHeight>
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16" paddingX="8">
          <SideNav pathname={pathname} collapsed={false} />
        </Column>
      </Drawer>
    </Column>
  );
}

/** Mounts the signed-in shell once for the Lumen screens; other routes render as they are. */
export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (!allHrefs.includes(pathname)) return <>{children}</>;
  return <Shell pathname={pathname}>{children}</Shell>;
}
