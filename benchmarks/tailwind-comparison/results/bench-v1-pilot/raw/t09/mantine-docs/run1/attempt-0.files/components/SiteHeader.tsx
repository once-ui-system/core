"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Burger, Button, Container, Drawer, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { brand, navLinks } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";
import classes from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  const isCurrent = (href: string) => href === pathname;

  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Anchor component={Link} href="/" className={classes.logo} underline="never" aria-label="Lumen home">
          {brand.name}
        </Anchor>

        <nav aria-label="Main" className={classes.desktopNav}>
          <Group gap="xs">
            {navLinks.map((link) => (
              <Anchor
                key={link.href}
                component={Link}
                href={link.href}
                className={classes.link}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                data-active={isCurrent(link.href) || undefined}
                underline="never"
              >
                {link.label}
              </Anchor>
            ))}
          </Group>
        </nav>

        <Group gap="xs" className={classes.actions}>
          <Button component={Link} href="/pricing" size="sm" className={classes.cta}>
            Start free
          </Button>
          <ThemeToggle />
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            aria-label={opened ? "Close navigation menu" : "Open navigation menu"}
          />
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size="xs"
        title={brand.name}
        padding="md"
        hiddenFrom="sm"
        zIndex={300}
      >
        <nav aria-label="Mobile">
          <Stack gap="xs">
            {navLinks.map((link) => (
              <Anchor
                key={link.href}
                component={Link}
                href={link.href}
                onClick={close}
                className={classes.mobileLink}
                aria-current={isCurrent(link.href) ? "page" : undefined}
                underline="never"
              >
                {link.label}
              </Anchor>
            ))}
            <Button component={Link} href="/pricing" onClick={close} mt="sm">
              Start free
            </Button>
          </Stack>
        </nav>
      </Drawer>
    </header>
  );
}
