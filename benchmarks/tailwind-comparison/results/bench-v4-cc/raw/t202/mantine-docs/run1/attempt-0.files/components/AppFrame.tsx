"use client";

import { Avatar, Button, Group, Text } from "@mantine/core";
import { IconLayoutGrid, IconListDetails, IconUsersGroup } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP, EVENT, PLANNER, initials } from "@/lib/data";
import css from "./seatwise.module.css";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Plan", icon: <IconLayoutGrid size={18} /> },
    { href: "/guests", label: "Guests", icon: <IconListDetails size={18} /> },
  ];

  return (
    <div className={css.frame}>
      <a className={css.skip} href="#main">
        Skip to content
      </a>
      <header className={`${css.header} ${css.noPrint}`}>
        <div className={css.headerInner}>
          <Link href="/" className={css.brand} aria-label={`${APP.name}, seating plan`}>
            <span className={css.brandMark} aria-hidden="true">
              <IconUsersGroup size={20} />
            </span>
            {APP.name}
          </Link>
          <nav aria-label="Main">
            <Group gap={6}>
              {links.map((l) => {
                const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
                return (
                  <Button
                    key={l.href}
                    component={Link}
                    href={l.href}
                    variant={active ? "light" : "subtle"}
                    color={active ? "moss" : "gray"}
                    leftSection={l.icon}
                    aria-current={active ? "page" : undefined}
                  >
                    {l.label}
                  </Button>
                );
              })}
            </Group>
          </nav>
          <Group gap="sm" ml="auto" wrap="nowrap">
            <div style={{ textAlign: "right" }}>
              <Text size="sm" fw={600} lh={1.2} visibleFrom="md">
                {EVENT.name}
              </Text>
              <Text size="xs" c="dimmed" lh={1.2} visibleFrom="md">
                {EVENT.venue}
              </Text>
            </div>
            <Avatar color="moss" radius="xl" size={36} title={PLANNER.name} aria-label={`Signed in as ${PLANNER.name}`}>
              {initials(PLANNER.name)}
            </Avatar>
          </Group>
        </div>
      </header>
      <main id="main" className={css.main}>
        {children}
      </main>
    </div>
  );
}
