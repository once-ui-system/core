"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Column,
  Drawer,
  Feedback,
  IconButton,
  NavIcon,
  Row,
  Select,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { createBrowserSupabase } from "@/lib/sb/browser";
import { schema } from "@/resources";

export type OrgOption = { slug: string; name: string };

/**
 * The signed-in frame: header with the org switcher and user menu, and a
 * sidebar (Dashboard, Members, Settings) that becomes a drawer on mobile.
 */
export function Shell({
  email,
  demo,
  orgs,
  children,
}: {
  email: string;
  demo: boolean;
  orgs: OrgOption[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const segment = pathname.match(/^\/app\/([^/]+)/)?.[1];
  const slug = segment && segment !== "new" ? segment : undefined;

  const nav = slug
    ? [
        { label: "Dashboard", href: `/app/${slug}`, icon: "grid" as const },
        { label: "Members", href: `/app/${slug}/members`, icon: "people" as const },
        { label: "Settings", href: `/app/${slug}/settings`, icon: "settings" as const },
      ]
    : [];

  async function signOut() {
    if (!demo) await createBrowserSupabase().auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  const navLinks = nav.map((item) => {
    const active = pathname === item.href;
    return (
      <Button
        key={item.href}
        fillWidth
        size="m"
        variant={active ? "secondary" : "tertiary"}
        prefixIcon={item.icon}
        label={item.label}
        href={item.href}
        onClick={() => setNavOpen(false)}
      />
    );
  });

  return (
    <Column fillWidth minHeight="100vh">
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="16"
        horizontal="between"
        vertical="center"
        wrap
        background="page"
        borderBottom
      >
        <Row vertical="center" gap="12" wrap>
          {slug && (
            <NavIcon
              hide
              m={{ hide: false }}
              active={navOpen}
              onClick={() => setNavOpen(!navOpen)}
            />
          )}
          <SmartLink href="/app" unstyled>
            <Text variant="heading-strong-s" onBackground="neutral-strong">
              {schema.name}
            </Text>
          </SmartLink>
          {orgs.length > 0 && (
            <Select
              id="org-switcher"
              label="Organization"
              value={slug ?? ""}
              options={orgs.map((org) => ({ value: org.slug, label: org.name }))}
              onSelect={(value) => {
                const next = Array.isArray(value) ? value[0] : value;
                if (next) router.push(`/app/${next}`);
              }}
            />
          )}
          <Button size="s" variant="tertiary" label="New organization" href="/app/new" />
        </Row>

        <Row position="relative" vertical="center">
          <IconButton
            icon="person"
            variant="tertiary"
            tooltip="Account"
            onClick={() => setUserOpen(!userOpen)}
          />
          {userOpen && (
            <Column
              position="absolute"
              right="0"
              top="48"
              zIndex={3}
              width="xs"
              gap="12"
              padding="16"
              radius="l"
              border="neutral-alpha-medium"
              background="surface"
            >
              <Text variant="body-default-s" onBackground="neutral-weak">
                {email || "Signed in"}
              </Text>
              {!demo && (
                <Button fillWidth variant="tertiary" size="s" label="Profile" href="/profile" onClick={() => setUserOpen(false)} />
              )}
              {!demo && <Button fillWidth variant="secondary" size="s" label="Sign out" onClick={signOut} />}
            </Column>
          )}
        </Row>
      </Row>

      {demo && (
        <Row paddingX="16" paddingTop="16">
          <Feedback
            variant="warning"
            title="Supabase is not configured"
            description="This is demo mode: sample data, and sign-in and changes are off."
          />
        </Row>
      )}

      <Row fillWidth flex={1}>
        {slug && (
          <>
            <Column as="nav" m={{ hide: true }} width="xs" paddingX="16" paddingY="24" gap="4" borderRight>
              {navLinks}
            </Column>
            <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size="s" title="Menu">
              <Column fillWidth padding="8" gap="4">
                {navLinks}
              </Column>
            </Drawer>
          </>
        )}
        <Column as="main" flex={1} padding="24" gap="24" minWidth="0">
          {children}
        </Column>
      </Row>
    </Column>
  );
}
