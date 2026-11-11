"use client";

import { usePathname } from "next/navigation";
import { Avatar, Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { event, planner } from "@/lib/data";

const SEATWISE_ROUTES = ["/", "/guests"];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (!SEATWISE_ROUTES.includes(pathname)) return <>{children}</>;

  return (
    <Column fillWidth>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="24"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        className="sw-header"
      >
        <Row gap="12" vertical="center">
          <Row
            width="32"
            height="32"
            radius="m"
            solid="brand-strong"
            center
            aria-hidden="true"
            onSolid="brand-strong"
          >
            <Text variant="label-strong-m">S</Text>
          </Row>
          <Column gap="2">
            <Text variant="heading-strong-m">Seatwise</Text>
          </Column>
        </Row>

        <Column gap="2" flex={1} minWidth={12} s={{ hide: true }}>
          <Text variant="label-strong-m" truncate>
            {event.name}
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak" truncate>
            {formatDate(event.date)} · {event.venue}
          </Text>
        </Column>

        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          <Button
            href="/"
            size="s"
            variant={pathname === "/" ? "secondary" : "tertiary"}
            prefixIcon="grid"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            size="s"
            variant={pathname === "/guests" ? "secondary" : "tertiary"}
            prefixIcon="people"
            aria-current={pathname === "/guests" ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Avatar size="s" value="HB" />
          <Text variant="label-default-s">{planner.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        {children}
      </Column>
    </Column>
  );
}
