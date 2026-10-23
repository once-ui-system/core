"use client";

import {
  Button,
  Column,
  Drawer,
  DropdownWrapper,
  Icon,
  IconButton,
  Nav,
  NavItem,
  Option,
  Row,
  selectNavHref,
  Text,
  ThemeSwitcher,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/auth/actions";
import { brand } from "@/resources/once-ui.config";
import { CreateOrgDialog } from "./CreateOrgDialog";

export type ShellProps = {
  demo: boolean;
  user: { email: string };
  orgs: { slug: string; name: string }[];
  current: { slug: string; name: string } | null;
  children: React.ReactNode;
};

export function AppShell({ demo, user, orgs, current, children }: ShellProps) {
  const pathname = usePathname() ?? "";
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const base = current ? `/app/${current.slug}` : "/app";
  const links = current
    ? [
        { href: base, label: "Dashboard", icon: "home" as const },
        { href: `${base}/members`, label: "Members", icon: "person" as const },
        { href: `${base}/settings`, label: "Settings", icon: "settings" as const },
      ]
    : [];
  const selected = selectNavHref(pathname, links.map((l) => l.href));

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {links.map((l) => (
        <NavItem key={l.href} href={l.href} icon={l.icon} label={l.label} selected={l.href === selected} />
      ))}
    </Nav>
  );

  const switcher = (
    <DropdownWrapper
      placement="bottom-start"
      trigger={
        <Button
          variant="secondary"
          size="s"
          suffixIcon="chevronDown"
          label={current ? current.name : "Select organization"}
        />
      }
      dropdown={
        <Column padding="4" gap="2" minWidth={14}>
          {orgs.map((o) => (
            <Option key={o.slug} value={o.slug} href={`/app/${o.slug}`} label={o.name} selected={o.slug === current?.slug} />
          ))}
          <Option
            value="new"
            label="Create organization"
            prefix={<Icon name="plus" size="s" onBackground="neutral-weak" />}
            onClick={() => setCreateOpen(true)}
          />
        </Column>
      }
    />
  );

  const initials = (user.email.charAt(0) || "U").toUpperCase();
  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {user.email}
        </Text>
      </Column>
      <Option value="profile" href="/app/profile" label="Profile" prefix={<Icon name="person" size="s" onBackground="neutral-weak" />} />
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
        onClick={() => {
          void signOut();
        }}
      />
    </Column>
  );

  return (
    <Column fill flex={1}>
      {demo && (
        <Row fillWidth horizontal="center" paddingX="16" paddingY="8" background="brand-alpha-weak">
          <Text variant="label-default-s" onBackground="brand-strong">
            Demo mode: Supabase is not configured, so sign-in is off and the data is sample data.
          </Text>
        </Row>
      )}
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        {links.length > 0 && (
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              aria-expanded={menuPath === pathname}
              onClick={() => setMenuPath(pathname)}
            />
          </Row>
        )}
        <Row s={{ hide: true }}>
          <Text variant="heading-strong-s">{brand.name}</Text>
        </Row>
        {switcher}
        <Row flex={1} />
        <ThemeSwitcher collapsed direction="column" />
        <UserMenu placement="bottom-end" avatarProps={{ value: initials }} dropdown={account} />
      </Row>

      <Row fill paddingX="8">
        {links.length > 0 && (
          <Column s={{ hide: true }} maxWidth={16} minWidth={14} fitHeight position="sticky" top="56">
            {sideNav}
          </Column>
        )}
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" fitHeight gap="24">
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer open={menuPath === pathname} onClose={() => setMenuPath(null)} side="left" size="s" title="Menu" flush>
        <Column paddingTop="64" paddingBottom="16">
          {sideNav}
        </Column>
      </Drawer>
      <CreateOrgDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Column>
  );
}
