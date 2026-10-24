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
  Text,
  ThemeSwitcher,
  UserMenu,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { site } from "../resources/once-ui.config";
import { DemoNotice } from "./DemoNotice";

export type ShellOrg = { slug: string; name: string; role: string };

const sections: { label: string; icon: IconName; path: string; exact?: boolean }[] = [
  { label: "Dashboard", icon: "home", path: "", exact: true },
  { label: "Members", icon: "people", path: "/members" },
  { label: "Settings", icon: "settings", path: "/settings" },
];

/** The signed-in frame: top bar with org switcher and user menu, sidebar, content panel. */
export function AppShell({
  children,
  email,
  demo,
  orgs,
}: {
  children: React.ReactNode;
  email: string;
  demo: boolean;
  orgs: ShellOrg[];
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [menuPath, setMenuPath] = useState<string | null>(null);

  const match = pathname.match(/^\/app\/([^/]+)/);
  const currentSlug = match && match[1] !== "new" && match[1] !== "profile" ? match[1] : null;
  const currentOrg = orgs.find((org) => org.slug === currentSlug) ?? null;

  const sideNav = (
    <Nav fill paddingX="8" density="compact" aria-label="Organization">
      {currentSlug &&
        sections.map((section) => {
          const href = `/app/${currentSlug}${section.path}`;
          const selected = section.exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <NavItem key={section.label} href={href} icon={section.icon} label={section.label} selected={selected} />;
        })}
    </Nav>
  );

  const account = (
    <Column padding="4" gap="2" minWidth={12}>
      <Column paddingX="12" paddingY="8">
        <Text variant="label-strong-s">Signed in as</Text>
        <Text variant="body-default-xs" onBackground="neutral-weak">
          {email}
        </Text>
      </Column>
      <Button variant="tertiary" fillWidth horizontal="start" prefixIcon="person" label="Profile" href="/app/profile" />
      {!demo && (
        <form action={signOutAction}>
          <Button type="submit" variant="tertiary" fillWidth horizontal="start" prefixIcon="logout" label="Sign out" />
        </form>
      )}
    </Column>
  );

  const avatar = { value: initials(email) };

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
          <Text variant="heading-strong-s">{site.name}</Text>
        </Row>
        <Row flex={1}>
          <DropdownWrapper
            trigger={
              <Button
                size="s"
                variant="secondary"
                suffixIcon="chevronDown"
                label={currentOrg?.name ?? (orgs.length ? "Choose organization" : "No organization")}
              />
            }
            dropdown={
              <Column padding="4" gap="2" minWidth={12}>
                {orgs.map((org) => (
                  <Option key={org.slug} value={org.slug} label={org.name} selected={org.slug === currentSlug} />
                ))}
                <Option value="new" label="Create organization" prefix={<Icon name="plus" size="s" onBackground="neutral-weak" />} />
              </Column>
            }
            onSelect={(value) => router.push(value === "new" ? "/app/new" : `/app/${value}`)}
          />
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
            <Column maxWidth="xl" paddingX="24" paddingY="32" gap="24" fitHeight>
              {demo && <DemoNotice />}
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
        <Column paddingTop="64" paddingBottom="16">
          {sideNav}
        </Column>
      </Drawer>
    </Column>
  );
}

function initials(value: string) {
  const letters = value.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).map((part) => part.charAt(0));
  return letters.join("").slice(0, 2).toUpperCase() || "?";
}
