"use client";

import { Button, Column, DropdownWrapper, Drawer, IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { schema } from "@/resources";
import { CreateOrgDialog } from "./CreateOrgDialog";
import { SupabaseNotice } from "@/components/SupabaseNotice";
import { UserMenu } from "./UserMenu";

export type ShellOrg = { id: string; slug: string; name: string; role: string };

type Props = {
  demo: boolean;
  email: string | null;
  organizations: ShellOrg[];
  children: React.ReactNode;
};

/** The organization slug in the URL, if the page is under /app/[org]. */
function slugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/app\/([^/]+)/);
  return match ? match[1] : null;
}

/** The signed-in frame: header with the org switcher and account menu, sidebar, content. */
export function AppShell({ demo, email, organizations, children }: Props) {
  const pathname = usePathname() ?? "";
  const slug = slugFromPath(pathname);
  const current = organizations.find((org) => org.slug === slug) ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const nav = current
    ? [
        { label: "Dashboard", href: `/app/${current.slug}`, icon: "home" as const },
        { label: "Members", href: `/app/${current.slug}/members`, icon: "people" as const },
        { label: "Settings", href: `/app/${current.slug}/settings`, icon: "settings" as const },
      ]
    : [];

  const navLinks = (onNavigate?: () => void) =>
    nav.map((item) => {
      const active = pathname === item.href;
      return (
        <Button
          key={item.href}
          href={item.href}
          label={item.label}
          prefixIcon={item.icon}
          variant={active ? "secondary" : "tertiary"}
          fillWidth
          horizontal="start"
          onClick={onNavigate}
        />
      );
    });

  return (
    <Column fillWidth minHeight="100vh" background="page">
      <Row
        as="header"
        fillWidth
        vertical="center"
        horizontal="between"
        gap="8"
        borderBottom
        paddingX="16"
        paddingY="12"
        position="sticky"
        top="0"
        zIndex={2}
        background="page"
      >
        <Row vertical="center" gap="8">
          {nav.length > 0 && (
            <Row hide s={{ hide: false }}>
              <IconButton icon="menu" variant="tertiary" ariaLabel="Open menu" onClick={() => setMenuOpen(true)} />
            </Row>
          )}
          <SmartLink href="/app" unstyled>
            <Text variant="heading-strong-s" onBackground="neutral-strong">
              {schema.name}
            </Text>
          </SmartLink>
          <DropdownWrapper
            open={switcherOpen}
            onOpenChange={setSwitcherOpen}
            placement="bottom-start"
            trigger={
              <Button
                variant="secondary"
                size="s"
                label={current?.name ?? "Organizations"}
                suffixIcon="chevronDown"
                onClick={() => setSwitcherOpen(!switcherOpen)}
              />
            }
            dropdown={
              <Column padding="8" gap="4" minWidth="160">
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    href={`/app/${org.slug}`}
                    label={org.name}
                    variant={org.slug === slug ? "secondary" : "tertiary"}
                    size="s"
                    fillWidth
                    horizontal="start"
                    onClick={() => setSwitcherOpen(false)}
                  />
                ))}
                {!demo && (
                  <Button
                    label="Create organization"
                    prefixIcon="plus"
                    variant="tertiary"
                    size="s"
                    fillWidth
                    horizontal="start"
                    onClick={() => {
                      setSwitcherOpen(false);
                      setCreateOpen(true);
                    }}
                  />
                )}
              </Column>
            }
          />
        </Row>
        <UserMenu email={email} demo={demo} />
      </Row>

      {demo && (
        <Column paddingX="16" paddingTop="16">
          <SupabaseNotice />
        </Column>
      )}

      <Row fillWidth flex={1}>
        {nav.length > 0 && (
          <Column as="nav" s={{ hide: true }} width="160" paddingX="16" paddingY="24" gap="4" borderRight>
            {navLinks()}
          </Column>
        )}
        <Column as="main" flex={1} minWidth="0" paddingX="16" paddingY="24">
          {children}
        </Column>
      </Row>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" size="s" title={schema.name}>
        <Column padding="16" gap="4">
          {navLinks(() => setMenuOpen(false))}
        </Column>
      </Drawer>

      <CreateOrgDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Column>
  );
}
