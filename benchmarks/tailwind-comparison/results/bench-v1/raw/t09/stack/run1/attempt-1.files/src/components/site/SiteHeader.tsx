"use client";

import { brand, navLinks } from "@/lib/data";
import {
  Button,
  Column,
  Drawer,
  IconButton,
  Row,
  SmartLink,
  Text,
  ThemeSwitcher,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  // The drawer is open for the path it was opened on, so following a link in
  // it closes it along with the navigation.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      position="sticky"
      top="0"
      background="page"
      borderBottom
      zIndex={2}
    >
      <Row maxWidth="l" height="64" vertical="center" horizontal="between" paddingX="24" gap="16">
        <Row vertical="center" gap="32">
          <SmartLink href="/" aria-label={`${brand.name} home`}>
            <Text variant="heading-strong-l" onBackground="neutral-strong">
              {brand.name}
            </Text>
          </SmartLink>
          <Row as="nav" aria-label="Main" gap="24" vertical="center" s={{ hide: true }}>
            {navLinks.map((link) => (
              <SmartLink key={link.href} href={link.href} selected={link.href === pathname}>
                <Text variant="label-default-m">{link.label}</Text>
              </SmartLink>
            ))}
          </Row>
        </Row>

        <Row vertical="center" gap="12">
          <ThemeSwitcher collapsed direction="column" />
          <Row s={{ hide: true }}>
            <Button href="/pricing" size="s" label="Start free" />
          </Row>
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              ariaLabel="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuPath(pathname)}
            />
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="right"
        size="s"
        title="Menu"
      >
        <Column as="nav" aria-label="Mobile" gap="16" paddingTop="24">
          {navLinks.map((link) => (
            <SmartLink key={link.href} href={link.href}>
              <Text variant="heading-strong-m">{link.label}</Text>
            </SmartLink>
          ))}
          <Button href="/pricing" fillWidth label="Start free" />
        </Column>
      </Drawer>
    </Row>
  );
}
