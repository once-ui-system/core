"use client";

import {
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Nav,
  NavItem,
  Row,
  Select,
  Text,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/(site)/auth/actions";
import { appNav, brand } from "../resources/once-ui.config";

type OrgLink = { slug: string; name: string };

// Segments under /app that are not organizations.
const RESERVED = ["new", "profile"];

/**
 * The signed-in frame: top bar with an organization switcher and a user menu, a
 * sidebar for the current organization, and a content panel. Below `s` the
 * sidebar becomes a left drawer.
 */
export function AppShell({
  orgs,
  email,
  demo,
  children,
}: {
  orgs: OrgLink[];
  email: string;
  demo: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menuPath, setMenuPath] = useState<string | null>(null);

  const match = pathname.match(/^\/app\/([^/]+)/);
  const currentSlug = match && !RESERVED.includes(match[1]) ? match[1] : null;
  const currentOrg = orgs.find((o) => o.slug === currentSlug);

  const sideNav = currentSlug ? (
    <Nav fill paddingX="8" density="compact" aria-label="Organization">
      {appNav.map((item) => {
        const href = `/app/${currentSlug}${item.segment}`;
        const selected = item.segment === "" ? pathname === href : pathname.startsWith(href);
        return <NavItem key={href} href={href} label={item.label} icon={item.icon} selected={selected} />;
      })}
    </Nav>
  ) : null;

  const initials = email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const account = (
    <Column padding="4" gap="4" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">Signed in as</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {email}
        </Text>
      </Column>
      <Button href="/app/profile" variant="tertiary" label="Profile" horizontal="start" />
      <form action={signOut}>
        <Button type="submit" variant="tertiary" label="Sign out" horizontal="start" />
      </form>
    </Column>
  );

  return (
    <Column fill minHeight="100vh">
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-expanded={menuPath === pathname}
            onClick={() => setMenuPath(pathname)}
            disabled={!currentSlug}
          />
        </Row>
        <Button href="/app" variant="tertiary" label={brand.name} weight="strong" />
        <Row flex={1} />
        {orgs.length > 0 ? (
          <Row minWidth={14}>
            <Select
              id="org-switcher"
              label="Organization"
              options={orgs.map((o) => ({ value: o.slug, label: o.name }))}
              value={currentOrg?.slug}
              onSelect={(value) => {
                if (typeof value === "string") router.push(`/app/${value}`);
              }}
              fillWidth
            />
          </Row>
        ) : null}
        <Row s={{ hide: true }}>
          <UserMenu name={email} placement="bottom-end" avatarProps={{ value: initials }} dropdown={account} />
        </Row>
        <Row hide s={{ hide: false }}>
          <UserMenu placement="bottom-end" avatarProps={{ value: initials }} dropdown={account} />
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
            <Column maxWidth="xl" paddingX="24" paddingY="32" gap="24">
              {children}
              {demo ? (
                <Row gap="8" vertical="center">
                  <Icon name="info" size="s" onBackground="neutral-weak" />
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Supabase is not configured: this is demo data and accounts are off.
                  </Text>
                </Row>
              ) : null}
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
        <Column paddingTop="64" paddingBottom="16">
          {sideNav}
        </Column>
      </Drawer>
    </Column>
  );
}
