"use client";

import {
  Button,
  Column,
  Dialog,
  DropdownWrapper,
  Drawer,
  Icon,
  IconButton,
  Nav,
  NavItem,
  Option,
  Row,
  selectNavHref,
  Text,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "../lib/supabase/browser";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { brand } from "../resources/config";
import { CreateOrgForm } from "./CreateOrgForm";

type OrgLite = { slug: string; name: string };

export function AppShell({
  org,
  orgs,
  email,
  demo,
  children,
}: {
  org: OrgLite;
  orgs: OrgLite[];
  email: string;
  demo: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const base = `/app/${org.slug}`;
  const links = [
    { href: base, label: "Dashboard", icon: "grid" as const },
    { href: `${base}/members`, label: "Members", icon: "people" as const },
    { href: `${base}/settings`, label: "Settings", icon: "settings" as const },
  ];
  const current = selectNavHref(pathname, links.map((l) => l.href));

  async function signOut() {
    if (isSupabaseConfigured()) await createBrowserSupabase().auth.signOut();
    router.push(isSupabaseConfigured() ? "/auth" : "/");
    router.refresh();
  }

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {links.map((l) => (
        <NavItem key={l.href} href={l.href} icon={l.icon} label={l.label} selected={l.href === current} />
      ))}
    </Nav>
  );

  const switcher = (
    <DropdownWrapper
      placement="bottom-start"
      onSelect={(value) => {
        if (value === "__new") setCreating(true);
        else router.push(`/app/${value}`);
      }}
      trigger={<Button variant="secondary" size="s" label={org.name} suffixIcon="chevronDown" aria-label="Switch organization" />}
      dropdown={
        <Column padding="4" gap="2" minWidth={12}>
          {orgs.map((o) => (
            <Option key={o.slug} value={o.slug} label={o.name} selected={o.slug === org.slug} />
          ))}
          <Option value="__new" label="New organization" prefix={<Icon name="plus" size="s" onBackground="neutral-weak" />} />
        </Column>
      }
    />
  );

  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">Signed in</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {email}
        </Text>
      </Column>
      <Option value="profile" label="Profile" prefix={<Icon name="person" size="s" onBackground="neutral-weak" />} />
      <Option value="sign-out" label="Sign out" prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />} />
    </Column>
  );
  const onAccount = (v: string) => {
    if (v === "profile") router.push(`${base}/profile`);
    if (v === "sign-out") void signOut();
  };
  const avatar = { value: (email[0] ?? "?").toUpperCase() };

  return (
    <Column fill flex={1}>
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open menu"
            aria-expanded={menuPath === pathname}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row s={{ hide: true }}>
          <Text variant="heading-strong-s">{brand.name}</Text>
        </Row>
        {switcher}
        <Row flex={1} />
        <UserMenu placement="bottom-end" avatarProps={avatar} dropdown={account} onSelect={onAccount} />
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={16} fitHeight position="sticky" top="56">
          {sideNav}
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row as="main" height="below-header" overflowY="auto" topRadius="l" horizontal="center" fillWidth background="surface" border>
            <Column maxWidth="xl" paddingX="24" paddingY="32" gap="24" fillWidth fitHeight>
              {demo && (
                <Row background="page" border radius="m" paddingX="16" paddingY="8" role="status">
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Demo mode: Supabase is not configured, so sign-in is off and this is sample data.
                  </Text>
                </Row>
              )}
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
      <Dialog open={creating} onClose={() => setCreating(false)} title="New organization">
        <CreateOrgForm demo={demo} onDone={() => setCreating(false)} />
      </Dialog>
    </Column>
  );
}
