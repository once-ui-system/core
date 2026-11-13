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
  SmartLink,
  selectNavHref,
  Text,
  User,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navSections, product, user } from "../lib/data";

/**
 * The signed-in frame, mounted once in the root layout so open groups and the
 * collapsed state survive navigation. Only the content pane scrolls.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const current = selectNavHref(
    pathname,
    navSections.flatMap((section) => section.items.map((item) => item.href)),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [collapsed, setCollapsed] = useState(false);

  const section = navSections.find((s) => s.items.some((item) => item.href === current));
  const page = section?.items.find((item) => item.href === current);
  const crumbs = [
    { label: product, href: "/" },
    ...(section ? [{ label: section.label }] : []),
    ...(page ? [{ label: page.label }] : []),
  ];

  const initials = user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email}
        </Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.role}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

  const renderNav = (isCollapsed: boolean) => (
    <Nav fillWidth paddingX="8" density="compact" collapsed={isCollapsed} aria-label="Main">
      {navSections.map((entry) => (
        <NavGroup
          key={entry.label}
          label={entry.label}
          icon={entry.icon}
          defaultOpen={entry.items.some((item) => item.href === current)}
        >
          {entry.items.map((item) => (
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
        <Row minWidth="12rem" s={{ minWidth: 0 }}>
          <SmartLink href="/" aria-label={`${product} home`}>
            <Text as="span" family="heading" textVariant="heading-strong-l">
              {product}
            </Text>
          </SmartLink>
        </Row>
        <Row flex={1} minWidth={0}>
          <Breadcrumbs items={crumbs} aria-label="Breadcrumb" />
        </Row>
        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={{ value: initials }}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={{ value: initials }} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column
          s={{ hide: true }}
          width={collapsed ? "56" : "16rem"}
          fitHeight
          position="sticky"
          top="56"
          gap="8"
        >
          {renderNav(collapsed)}
          <Row paddingX="8" horizontal={collapsed ? "center" : "start"}>
            <IconButton
              icon={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
              variant="tertiary"
              size="s"
              tooltip={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Row>
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
            <Column fillWidth maxWidth="xl" paddingX="24" paddingY="24" s={{ paddingX: "12" }} fitHeight>
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
