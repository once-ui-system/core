"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { planner } from "@/lib/data";
import { usePlan } from "./PlanProvider";

const nav = [
  { href: "/", label: "Seating plan", icon: "grid" },
  { href: "/guests", label: "Guest list", icon: "people" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { notice } = usePlan();

  return (
    <Column fillWidth flex="1">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="16"
        paddingY="8"
        gap="16"
        vertical="center"
        horizontal="between"
      >
        <Row gap="12" vertical="center">
          <Row center width="32" height="32" radius="m" solid="brand-strong">
            <Icon name="people" size="s" onSolid="brand-strong" />
          </Row>
          <Text textVariant="heading-strong-m">Seatwise</Text>
        </Row>
        <Row as="nav" aria-label="Main" gap="4">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Button
                key={item.href}
                href={item.href}
                size="s"
                variant={active ? "secondary" : "ghost"}
                prefixIcon={item.icon}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Button>
            );
          })}
        </Row>
        <Row gap="8" vertical="center">
          <Row s={{ hide: true }}>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {planner.name}
            </Text>
          </Row>
          <Avatar size="s" value="HB" />
        </Row>
      </Row>
      <VisuallyHidden as="div" role="status" aria-live="polite">
        {notice}
      </VisuallyHidden>
      {children}
    </Column>
  );
}
