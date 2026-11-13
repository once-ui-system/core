"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Burger, Button, Collapse, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { brand, navLinks } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";
import classes from "./SiteHeader.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  const links = navLinks.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={classes.link}
      data-active={pathname === item.href ? "" : undefined}
      aria-current={pathname === item.href ? "page" : undefined}
      onClick={close}
    >
      {item.label}
    </Link>
  ));

  return (
    <Box component="header" className={classes.header}>
      <Container>
        <div className={classes.inner}>
          <Link href="/" className={classes.logo} aria-label={`${brand.name} home`}>
            <span className={classes.mark} aria-hidden="true" />
            {brand.name}
          </Link>

          <Group gap="xs" visibleFrom="sm" component="nav" aria-label="Main">
            {links}
          </Group>

          <Group gap="sm" wrap="nowrap">
            <Button
              component={Link}
              href="/pricing"
              size="sm"
              visibleFrom="sm"
            >
              Start free
            </Button>
            <ThemeToggle />
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label={opened ? "Close navigation" : "Open navigation"}
              aria-expanded={opened}
              aria-controls="mobile-nav"
            />
          </Group>
        </div>

        <Collapse expanded={opened} hiddenFrom="sm" id="mobile-nav">
          <Box component="nav" aria-label="Mobile" className={classes.mobileNav}>
            {links}
          </Box>
        </Collapse>
      </Container>
    </Box>
  );
}
