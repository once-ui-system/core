"use client";

import {
  Button,
  Column,
  Drawer,
  Heading,
  IconButton,
  Nav,
  NavItem,
  Row,
  Text,
  UserMenu,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";

type OrgRef = { slug: string; name: string };

export function AppFrame({
  email,
  current,
  orgs,
  children,
}: {
  email: string;
  current: OrgRef;
  orgs: OrgRef[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const base = `/app/${current.slug}`;
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const links = [
    { href: base, label: "Dashboard", icon: "home" as const },
    { href: `${base}/members`, label: "Members", icon: "person" as const },
    { href: `${base}/settings`, label: "Settings", icon: "settings" as const },
  ];

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {links.map((l) => (
        <NavItem key={l.href} href={l.href} icon={l.icon} label={l.label} selected={pathname === l.href} />
      ))}
    </Nav>
  );

  const switcher = (
    <Column padding="4" gap="2" minWidth={12}>
      <Text variant="label-default-xs" onBackground="neutral-weak" paddingX="12" paddingY="4">
        Organizations
      </Text>
      {orgs.map((o) => (
        <Button
          key={o.slug}
          href={`/app/${o.slug}`}
          variant="tertiary"
          size="s"
          horizontal="start"
          fillWidth
          label={o.name}
          suffixIcon={o.slug === current.slug ? "check" : undefined}
        />
      ))}
      <Button href="/app/new" variant="tertiary" size="s" horizontal="start" fillWidth prefixIcon="plus" label="New organization" />
    </Column>
  );

  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Text variant="label-default-s" paddingX="12" paddingY="8">
        {email}
      </Text>
      <Button href="/app/profile" variant="tertiary" size="s" horizontal="start" fillWidth label="Profile" />
      <form method="post" action="/auth/signout">
        <Button type="submit" variant="tertiary" size="s" horizontal="start" fillWidth label="Sign out" />
      </form>
    </Column>
  );

  return (
    <Column fill flex={1} minHeight="100vh">
      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12" borderBottom>
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            aria-label="Open menu"
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Heading as="p" variant="heading-strong-s">
          Acme Notes
        </Heading>
        <DropdownOrgs switcher={switcher} name={current.name} />
        <Row flex={1} />
        <UserMenu
          placement="bottom-end"
          avatarProps={{ value: (email[0] ?? "U").toUpperCase() }}
          dropdown={account}
        />
      </Row>
      <Row fill paddingX="8">
        <Column s={{ hide: true }} minWidth={14} maxWidth={16} fitHeight position="sticky" top="56">
          {sideNav}
        </Column>
        <Row as="main" fill horizontal="center" background="surface" border topRadius="l">
          <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" gap="24" fitHeight>
            {children}
          </Column>
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

function DropdownOrgs({ switcher, name }: { switcher: React.ReactNode; name: string }) {
  return (
    <details style={{ position: "relative" }}>
      <summary style={{ cursor: "pointer", listStyle: "none" }} aria-label="Switch organization">
        <Row gap="4" vertical="center" paddingX="12" paddingY="4" border radius="m">
          <Text variant="label-default-s">{name}</Text>
          <Text variant="label-default-s" onBackground="neutral-weak">
            ▾
          </Text>
        </Row>
      </summary>
      <Row
        position="absolute"
        background="overlay"
        border
        radius="m"
        style={{ top: "calc(100% + 4px)", left: 0, zIndex: 20 }}
      >
        {switcher}
      </Row>
    </details>
  );
}
