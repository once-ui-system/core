"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { app, dateLabel, event, planner } from "@/lib/data";

const nav = [
  { href: "/", label: "Seating plan", icon: "grid" as const },
  { href: "/guests", label: "Guest list", icon: "people" as const },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        horizontal="between"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <Row gap="12" vertical="center">
          <Row width="32" height="32" radius="m" solid="brand-strong" center onSolid="brand-strong" aria-hidden="true">
            <Icon name="heart" size="s" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text variant="heading-strong-m">{app}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              {event.name}
            </Text>
          </Column>
        </Row>
        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                href={item.href}
                variant={active ? "secondary" : "tertiary"}
                size="s"
                prefixIcon={item.icon}
                label={item.label}
                aria-current={active ? "page" : undefined}
              />
            );
          })}
        </Row>
        <Row gap="12" vertical="center" m={{ hide: true }}>
          <Column horizontal="end" gap="2">
            <Text variant="label-default-s">{dateLabel}</Text>
            <Text variant="label-default-xs" onBackground="neutral-weak">
              {event.venue}
            </Text>
          </Column>
          <Avatar value={planner.name.split(" ").map((p) => p[0]).join("")} size="s" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24" flex={1}>
        <Column fillWidth maxWidth={90} gap="24">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
