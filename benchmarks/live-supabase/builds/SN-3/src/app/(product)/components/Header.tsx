"use client";

import { schema } from "@/resources";
import {
  Avatar,
  Background,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbar,
  Line,
  Logo,
  NavIcon,
  Option,
  Row,
  ShineFx,
  SmartLink,
  Text,
  UserMenu,
} from "@once-ui-system/core";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NewOrgDialog } from "./NewOrgDialog";
import { Sidebar } from "./Sidebar";
import { useUser } from "@/components/UserProvider";
import { useOrg } from "@/components/OrgProvider";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { createClient } from "@/lib/sb/client";
import { isSupabaseConfigured } from "@/lib/sb/config";

interface HeaderProps {
  avatar?: string;
}

const closeOverlay = () => {
  setTimeout(() => {
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    document.dispatchEvent(event);
  }, 0);
};

/**
 * The header's right side, the docs link and the account menu: in the header
 * and in the menu drawer's top bar, which covers the header while it is open.
 */
const HeaderActions: React.FC<HeaderProps & { org: string }> = ({ avatar, org }) => {
  const router = useRouter();
  const { profile, userEmail } = useUser();

  // Real profile data when signed in (an empty avatar until they upload one);
  // the avatar prop keeps demo mode working
  const displayAvatar = profile ? profile.avatar_url || undefined : avatar;
  const displayName = profile ? profile.username || userEmail || "Account" : "Account";
  const displaySubline = profile?.username ? userEmail : null;

  const handleLogout = async () => {
    closeOverlay();
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/auth");
  };

  return (
    <>
      <UserMenu
        avatarProps={{
          empty: !displayAvatar,
          src: displayAvatar,
        }}
        dropdown={
          <Column paddingTop="24" minWidth={14}>
            <Background
              position="absolute"
              left="0"
              right="0"
              top="0"
              bottom="0"
              gradient={{
                display: true,
                x: 0,
                y: -50,
                colorStart: "brand-background-strong",
                colorEnd: "static-transparent",
              }}
            />
            <Background
              position="absolute"
              left="0"
              right="0"
              top="0"
              bottom="0"
              gradient={{
                display: true,
                x: 100,
                y: -50,
                colorStart: "accent-background-strong",
                colorEnd: "static-transparent",
              }}
            />
            <Column fillWidth horizontal="center" gap="2">
              <Avatar size={4} src={displayAvatar} marginBottom="16"/>
              <Text variant="heading-strong-s">
                {displayName}
              </Text>
              {displaySubline && (
                <Text marginBottom="12" variant="label-default-s" onBackground="neutral-weak">
                  {displaySubline}
                </Text>
              )}
            </Column>
            <Column fillWidth padding="4" gap="2">
              <Option prefix={<Icon onBackground="neutral-weak" size="s" name="person" />} label="Profile" value="profile" href="/profile" onClick={closeOverlay} />
            </Column>
            <Line />
            <Column fillWidth padding="4" gap="2">
              <Option prefix={<Icon onBackground="neutral-weak" size="s" name="logout" />} label="Sign out" value="logout" onClick={() => void handleLogout()} />
            </Column>
          </Column>
        }
      />
    </>
  );
};

const Header: React.FC<HeaderProps> = ({ avatar }) => {
  const pathname = usePathname();
  const { organizations, selected, slug, select, loading: orgsLoading } = useOrg();
  // The menu is open for the path it was opened on, so following a link in
  // it closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);
  const [isMac, setIsMac] = useState(false);
  const [newOrgOpen, setNewOrgOpen] = useState(false);

  // The URL segment is what decides the tenant, so every in-header link is
  // built from it — not from `selected`, which is null until /api/orgs comes
  // back and stays null in demo mode.
  const org = slug ?? DEMO_ORG_SLUG;
  const workspaceName = selected?.name || (org === DEMO_ORG_SLUG ? schema.name : org);

  React.useEffect(() => {
    // Only run on the client side after hydration
    setIsMac(/Mac/i.test(navigator.platform));
  }, []);

  /**
   * The workspace switcher: a `UserMenu` for the trigger and one `Option`
   * per organization, with `selected` marking the current one. Composition
   * over the primitives rather than a component of its own — what differs
   * between apps built on this shell is the routing, which `select` owns,
   * not the markup.
   *
   * Held in a variable because the same switcher appears twice: in the
   * header, and in the drawer's top bar, which covers the header on narrow
   * screens. It is this shell's mark, where the other headers have a logo.
   */
  const workspaceMenu = (
    <UserMenu
      name={workspaceName}
      subline={selected?.personal ? "Personal" : undefined}
      avatarProps={{ value: workspaceName.charAt(0).toUpperCase() }}
      dropdown={
        <Column fillWidth padding="4" gap="2">
          <Text
            variant="body-default-xs"
            onBackground="neutral-weak"
            paddingX="12"
            paddingY="8"
          >
            Workspaces
          </Text>
          {organizations.map((organization) => (
            <Option
              key={organization.id}
              value={organization.slug}
              label={organization.name}
              description={organization.personal ? "Personal" : undefined}
              selected={organization.slug === slug}
              suffix={
                organization.slug === slug ? (
                  <Icon name="check" size="xs" onBackground="neutral-weak" />
                ) : undefined
              }
              onClick={(value) => {
                closeOverlay();
                select(value);
              }}
            />
          ))}
          {organizations.length === 0 && (
            <Text
              variant="body-default-s"
              onBackground="neutral-weak"
              paddingX="12"
              paddingY="8"
            >
              {orgsLoading ? <ShineFx>Loading</ShineFx> : <Row paddingBottom="4">No workspaces yet</Row>}
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

  return (
    <Row
      as="header"
      fillWidth
      minHeight="56"
      position="sticky"
      top="0"
      background="page"
      vertical="center"
      zIndex={1}
    >
      <Row gap="4" vertical="center" minWidth={18} paddingX="16">
        <NavIcon
          hide
          m={{ hide: false }}
          active={menuOpen}
          onClick={() => setMenuPath(menuOpen ? null : pathname)}
        />
        <Drawer
          open={menuOpen}
          onClose={closeMenu}
          side="left"
          size="m"
          title="Menu"
          flush
          showClose={false}
          background="page"
          radius="xl-4"
        >
          {/* The header's row, so the workspace and the account stay where
              they were while the drawer covers the header. Sticky, so a long
              menu scrolls under it. */}
          <Row
            fillWidth
            minHeight="56"
            position="sticky"
            zIndex={1}
            background="page"
            paddingLeft="16"
            paddingRight="20"
            gap="12"
            vertical="center"
            horizontal="between"
          >
            <Row gap="4" vertical="center">
              {workspaceMenu}
            </Row>
            <Row vertical="center" gap="12">
              <HeaderActions avatar={avatar} org={org} />
              <IconButton icon="close" variant="tertiary" tooltip="Close" onClick={closeMenu} />
            </Row>
          </Row>
          <Column fillWidth gap="4" padding="8">
            <Sidebar />
          </Column>
        </Drawer>
        {workspaceMenu}
      </Row>
      <Row fillWidth />
      <Row position="absolute" right="20" vertical="center" gap="12">
        <HeaderActions avatar={avatar} org={org} />
      </Row>
      <NewOrgDialog open={newOrgOpen} onClose={() => setNewOrgOpen(false)} />
    </Row>
  );
};

export { Header };
