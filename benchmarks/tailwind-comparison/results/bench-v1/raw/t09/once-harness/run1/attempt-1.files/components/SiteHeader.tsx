"use client";

import { Button, Column, Drawer, IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { brand, navItems } from "../lib/data";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  return (
    <Row
      as="header"
      fillWidth
      horizontal="center"
      paddingX="16"
      background="page"
      borderBottom
      style={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      <Row maxWidth="l" height="56" vertical="center" horizontal="between" gap="16">
        <SmartLink href="/" aria-label={`${brand.name} home`}>
          <Text as="span" family="heading" textVariant="heading-strong-l" onBackground="neutral-strong">
            {brand.name}
          </Text>
        </SmartLink>

        <Row as="nav" aria-label="Main" gap="4" s={{ hide: true }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              variant="tertiary"
              size="s"
              data-border="rounded"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Button>
          ))}
        </Row>

        <Row gap="8" vertical="center">
          <ThemeToggle />
          <Row s={{ hide: true }}>
            <Button href="/pricing" size="s" data-border="rounded">
              Get started
            </Button>
          </Row>
          <Row hide s={{ hide: false }}>
            <IconButton
              icon="menu"
              variant="tertiary"
              tooltip="Menu"
              aria-label="Open menu"
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
        <Column as="nav" aria-label="Mobile" gap="8" paddingTop="16">
          {navItems.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              variant="tertiary"
              fillWidth
              horizontal="start"
              data-border="rounded"
            >
              {item.label}
            </Button>
          ))}
          <Button href="/pricing" fillWidth data-border="rounded">
            Get started
          </Button>
        </Column>
      </Drawer>
    </Row>
  );
}
