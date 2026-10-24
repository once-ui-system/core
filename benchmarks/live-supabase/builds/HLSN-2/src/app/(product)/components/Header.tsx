"use client";

import { schema } from "@/resources";
import { Column, Drawer, Icon, Line, NavIcon, Option, Row, Text, UserMenu } from "@once-ui-system/core";
import type React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrg } from "@/components/OrgProvider";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { createClient } from "@/lib/sb/client";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { NewOrgDialog } from "./NewOrgDialog";
import { Sidebar } from "./Sidebar";

/** Closes an open UserMenu or Option list after a choice, the way the menu expects. */
const closeOverlay = () => {
  setTimeout(() => {
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
  }, 0);
};

/**
 * The signed-in header: the menu for narrow screens, the workspace switcher
 * (an organization list and "New organization"), and the account menu with
 * Profile and Sign out.
 */
export const Header: React.FC = () => {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { organizations, selected, slug, select, loading } = useOrg();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);
  const [newOrgOpen, setNewOrgOpen] = useState(false);

  // The URL segment, not `selected`: `selected` is null until the list loads
  // and stays null in demo mode.
  const org = slug ?? DEMO_ORG_SLUG;
  const workspaceName = selected?.name || (org === DEMO_ORG_SLUG ? schema.name : org);

  const signOut = async () => {
    closeOverlay();
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
    router.push("/auth");
  };

  const workspaceMenu = (
    <UserMenu
      name={workspaceName}
      subline={selected ? selected.role : undefined}
      avatarProps={{ value: workspaceName.charAt(0).toUpperCase() }}
      dropdown={
        <Column fillWidth padding="4" gap="2">
          <Text variant="body-default-xs" onBackground="neutral-weak" paddingX="12" paddingY="8">
            Organizations
          </Text>
          {organizations.map((organization) => (
            <Option
              key={organization.id}
              value={organization.slug}
              label={organization.name}
              selected={organization.slug === slug}
              suffix={organization.slug === slug ? <Icon name="check" size="xs" onBackground="neutral-weak" /> : undefined}
              onClick={(value) => {
                closeOverlay();
                select(value);
              }}
            />
          ))}
          {organizations.length === 0 && (
            <Text variant="body-default-s" onBackground="neutral-weak" paddingX="12" paddingY="8">
              {loading ? "Loading" : "No organizations yet"}
            </Text>
          )}
          <Line marginY="4" />
          <Option
            value="new-organization"
            label="New organization"
            prefix={<Icon name="plus" size="xs" onBackground="neutral-weak" />}
            onClick={() => {
              closeOverlay();
              setNewOrgOpen(true);
            }}
          />
        </Column>
      }
    />
  );

  const accountMenu = (
    <UserMenu
      avatarProps={{ empty: true }}
      dropdown={
        <Column fillWidth padding="4" gap="2" minWidth={12}>
          <Option
            prefix={<Icon onBackground="neutral-weak" size="s" name="person" />}
            label="Profile"
            value="profile"
            href="/profile"
            onClick={closeOverlay}
          />
          <Line />
          <Option
            prefix={<Icon onBackground="neutral-weak" size="s" name="logout" />}
            label="Sign out"
            value="sign-out"
            onClick={() => void signOut()}
          />
        </Column>
      }
    />
  );

  return (
    <Row
      as="header"
      fillWidth
      minHeight="56"
      position="sticky"
      top="0"
      background="page"
      vertical="center"
      horizontal="between"
      zIndex={1}
      paddingX="16"
      borderBottom="neutral-alpha-weak"
    >
      <Row gap="8" vertical="center">
        <NavIcon hide m={{ hide: false }} active={menuOpen} onClick={() => setMenuPath(menuOpen ? null : pathname)} />
        <Drawer open={menuOpen} onClose={closeMenu} side="left" size="s" title="Menu" flush showClose={false} background="page">
          <Column fillWidth flex={1} padding="8">
            <Sidebar onNavigate={closeMenu} />
          </Column>
        </Drawer>
        <Text variant="heading-strong-s" s={{ hide: true }}>{schema.name}</Text>
        {workspaceMenu}
      </Row>
      <Row gap="8" vertical="center">
        {accountMenu}
      </Row>
      <NewOrgDialog open={newOrgOpen} onClose={() => setNewOrgOpen(false)} />
    </Row>
  );
};
