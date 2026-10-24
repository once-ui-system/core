"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Nav,
  NavItem,
  Option,
  Row,
  Select,
  selectNavHref,
  Text,
  ThemeSwitcher,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { DemoNotice } from "@/components/DemoNotice";
import { signOutAction } from "@/lib/actions/auth";
import type { NavLink } from "@/resources/app";
import { brand } from "@/resources/once-ui.config";

type Props = {
  children: React.ReactNode;
  orgs: { slug: string; name: string }[];
  current: { slug: string; name: string };
  email: string;
  isDemo: boolean;
  links: NavLink[];
};

/**
 * The signed-in frame: top bar with the organization switcher and account menu,
 * a sidebar, and a raised content panel. Below `s` the sidebar hides and the menu
 * button opens the same nav, with the switcher, in a left drawer.
 */
export function AppShell({ children, orgs, current, email, isDemo, links }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const active = selectNavHref(
    pathname,
    links.map((link) => link.href),
  );
  const [menuPath, setMenuPath] = useState<string | null>(null);

  const pageLabel = links.find((link) => link.href === active)?.label;
  const crumbs = [
    { label: current.name, href: `/app/${current.slug}` },
    ...(pageLabel ? [{ label: pageLabel }] : []),
  ];

  const switcher = (id: string) => (
    <Select
      id={id}
      label="Organization"
      size="s"
      value={current.slug}
      options={orgs.map((org) => ({ value: org.slug, label: org.name }))}
      onSelect={(value) => {
        const slug = Array.isArray(value) ? value[0] : value;
        if (slug && slug !== current.slug) router.push(`/app/${slug}`);
      }}
    />
  );

  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">{email}</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {isDemo ? "Demo mode" : "Signed in"}
        </Text>
      </Column>
      <Option
        value="profile"
        label="Profile"
        href="/app/profile"
        prefix={<Icon name="person" size="s" onBackground="neutral-weak" />}
      />
      <form action={signOutAction}>
        <Button type="submit" variant="tertiary" size="s" fillWidth prefixIcon="logout" label="Sign out" />
      </form>
    </Column>
  );

  const avatar = { value: initials(email) };

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {links.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          selected={link.href === active}
        />
      ))}
    </Nav>
  );

  return (
    <Column fill flex={1}>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-expanded={menuPath === pathname}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row minWidth={16} s={{ minWidth: 0 }}>
          <Button variant="tertiary" href="/app" label={brand.name} size="s" />
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} />
        </Row>
        <Row s={{ flex: 1 }} />
        <Row minWidth={16} maxWidth={20} s={{ hide: true }}>
          {switcher("org-switcher")}
        </Row>
        <ThemeSwitcher collapsed direction="column" />
        <Row s={{ hide: true }}>
          <UserMenu name={email} placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={16} fitHeight position="sticky" top="56">
          {sideNav}
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
            <Column maxWidth="xl" paddingX="24" paddingY="32" fitHeight gap="24">
              {isDemo && <DemoNotice />}
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuPath === pathname}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16" gap="16" paddingX="16">
          {switcher("org-switcher-mobile")}
          {sideNav}
        </Column>
      </Drawer>
    </Column>
  );
}

const initials = (email: string) =>
  email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
