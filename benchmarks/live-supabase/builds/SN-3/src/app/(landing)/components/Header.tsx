"use client";

import type React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { megaMenu, mobileMenu } from "@/content";
import { schema } from "@/resources";
import {
  Button,
  Column,
  Drawer,
  Fade,
  IconButton,
  Logo,
  MegaMenu,
  MobileMegaMenu,
  NavIcon,
  Row,
  Text,
} from "@once-ui-system/core";

/**
 * The mark, linking home: in the header and in the menu drawer's top bar. One
 * Logo with a source per theme, not a `dark` and a `light` one: the hidden one
 * would be the first link in the drawer's focus trap, which then could neither
 * focus it on open nor wrap Tab back to it.
 */
const HeaderLogo: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Row vertical="center" gap="8">
    <Logo icon={schema.logo} size="s" href="/" onClick={onClick} />
    <Text variant="heading-strong-s" onBackground="neutral-strong">
      {schema.name}
    </Text>
  </Row>
);

/** The calls to action: in the header and in the menu drawer's top bar. */
const HeaderActions: React.FC = () => (
  <Row fitWidth vertical="center" gap="8">
    <Button size="s" label="Sign in" href="/auth" />
  </Row>
);

export const Header: React.FC = () => {
  const pathname = usePathname();
  // The menu is open for the path it was opened on, so following a link in
  // it closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const closeMenu = () => setMenuPath(null);

  return (
    <>
      <Fade height={4} fillWidth to="bottom" position="fixed" top="0" base="transparent" zIndex={2} pointerEvents="none"/>
      <Row
        fillWidth
        horizontal="center"
        paddingTop="8"
        paddingX="m" 
        position="sticky"
        top="0"
        zIndex={2}
      >
        <Row
          as="header"
          border
          maxWidth="l"
          radius="xl"
          paddingLeft="20"
          paddingRight="12"
          paddingY="12"
          vertical="center"
          background="page"
        >
          <Row gap="4" vertical="center">
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
              {/* The header's row, so the mark and the calls to action stay
                  where they were while the drawer covers the header: its
                  padding, and its height, which the 40px menu button sets
                  there. Sticky, so a long menu scrolls under it. */}
              <Row
                fillWidth
                minHeight="64"
                position="sticky"
                zIndex={1}
                background="page"
                paddingLeft="20"
                paddingRight="12"
                paddingY="12"
                gap="8"
                vertical="center"
                horizontal="between"
              >
                <Row gap="4" vertical="center">
                  <HeaderLogo onClick={closeMenu} />
                </Row>
                <Row vertical="center" gap="8">
                  <HeaderActions />
                  <IconButton icon="close" variant="tertiary" tooltip="Close" onClick={closeMenu} />
                </Row>
              </Row>
              <Column fillWidth flex={1} gap="16" padding="8">
                <MobileMegaMenu menuGroups={mobileMenu} onClose={closeMenu} />
              </Column>
            </Drawer>
            <HeaderLogo />
          </Row>
          
          <Row fillWidth vertical="center" horizontal="end">
            <Row
              m={{hide: true}}
              textVariant="label-default-s"
              fillWidth
              gap="16"
              paddingX="l"
              vertical="center"
            >
              <MegaMenu
                menuGroups={megaMenu}
              />
            </Row>
            <HeaderActions />
          </Row>
        </Row>
      </Row>
    </>
  );
};