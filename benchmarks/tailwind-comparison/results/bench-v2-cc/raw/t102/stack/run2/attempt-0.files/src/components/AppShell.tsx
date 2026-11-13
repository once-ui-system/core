"use client";

import {
  Breadcrumbs,
  Column,
  Drawer,
  Icon,
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
import { usePathname } from "next/navigation";
import { useState } from "react";
import { user } from "@/lib/data";

type NavLeaf = { label: string; href: string };
type NavGroupData = { label: string; icon: IconName; items: NavLeaf[] };

const nav: NavGroupData[] = [
  {
    label: "Analytics",
    icon: "barChart",
    items: [
      { label: "Overview", href: "/" },
      // Reports is the section of the dashboard that lists the latest activity.
      { label: "Reports", href: "/#reports" },
    ],
  },
  {
    label: "Workspace",
    icon: "folder",
    items: [
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

// Only real routes take part in the current-page match.
const routeHrefs = nav.flatMap((group) =>
  group.items.map((item) => item.href).filter((href) => !href.includes("#")),
);

const trail: Record<string, { group: string; page: string }> = {
  "/": { group: "Analytics", page: "Overview" },
  "/projects": { group: "Workspace", page: "Projects" },
  "/settings": { group: "Workspace", page: "Settings" },
};

function SideNav({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  const current = selectNavHref(pathname, routeHrefs);
  return (
    <Nav fill padding="8" density="spacious" collapsed={collapsed} aria-label="Main">
      {nav.map((group) => (
        <NavGroup key={group.label} label={group.label} icon={group.icon} defaultOpen>
          {group.items.map((item) => (
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
}

function Account({ compact }: { compact?: boolean }) {
  const dropdown = (
    <Column fillWidth padding="4" gap="2" minWidth={14}>
      <Text variant="body-default-s" onBackground="neutral-weak" paddingX="12" paddingY="8">
        {user.email}
      </Text>
      <Option
        value="settings"
        label="Settings"
        href="/settings"
        prefix={<Icon name="settings" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );
  return compact ? (
    <UserMenu avatarProps={{ value: user.name.charAt(0) }} dropdown={dropdown} />
  ) : (
    <UserMenu
      name={user.name}
      subline={user.role}
      avatarProps={{ value: user.name.charAt(0) }}
      dropdown={dropdown}
    />
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);
  // The drawer is open for the path it was opened on: following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);

  const page = trail[pathname] ?? trail["/"];
  const crumbs = [
    { label: "Lumen", href: "/" },
    { label: page.group },
    { label: page.page },
  ];

  return (
    <Column fill horizontal="center" flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        minHeight="56"
        paddingX="16"
        gap="12"
        vertical="center"
        position="sticky"
        top="0"
        background="page"
        zIndex={1}
      >
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            size="l"
            ariaLabel="Open menu"
            tooltip="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <IconButton
            icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
            variant="tertiary"
            size="l"
            ariaLabel={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          />
        </Row>
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Icon name="sparkle" onBackground="brand-strong" />
          <Text variant="heading-strong-m" family="heading">
            Lumen
          </Text>
        </Row>
        <Row flex={1} paddingLeft="8" vertical="center">
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <Account />
        </Row>
        <Row hide s={{ hide: false }}>
          <Account compact />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={18} minWidth={collapsed ? undefined : 16} fitHeight position="sticky" top="56">
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
          >
            <Column
              as="main"
              id="main"
              fillWidth
              maxWidth="xl"
              gap="32"
              paddingY="40"
              paddingX="24"
              s={{ paddingX: "16", paddingY: "24" }}
              fitHeight
            >
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuOpen} onClose={closeMenu} side="left" size="s" title="Menu" flush>
        <Column
          paddingTop="64"
          paddingBottom="16"
          onClick={(event) => {
            // A link inside the nav (the Reports anchor stays on the same path) closes the drawer.
            if ((event.target as HTMLElement).closest("a")) closeMenu();
          }}
        >
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>
    </Column>
  );
}

/** Frames the three Lumen screens with the shell; any other route is left alone. */
function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  if (!(pathname in trail)) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}

export { AppFrame, AppShell };
