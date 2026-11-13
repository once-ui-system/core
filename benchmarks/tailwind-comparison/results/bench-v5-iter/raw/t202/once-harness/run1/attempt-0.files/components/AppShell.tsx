"use client";

import { Avatar, Button, Column, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { event, formatDate, planner } from "@/lib/data";
import { usePlan } from "@/lib/plan";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { seatedCount, unseatedAttending } = usePlan();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="12"
        gap="16"
        vertical="center"
        borderBottom
        background="surface"
        wrap
      >
        <Row gap="12" vertical="center">
          <Row
            width="32"
            height="32"
            radius="m"
            solid="brand-strong"
            onSolid="brand-strong"
            center
            aria-hidden="true"
          >
            <Text textVariant="label-strong-m">S</Text>
          </Row>
          <Column gap="2">
            <Text textVariant="label-strong-m">Seatwise</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              Seating planner
            </Text>
          </Column>
        </Row>

        <Column flex={1} s={{ hide: true }}>
          <Text textVariant="label-strong-s">{event.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {formatDate(event.date)} · {event.venue}
          </Text>
        </Column>

        <Row gap="4" as="nav" aria-label="Main" s={{ flex: 1 }}>
          <Button
            href="/"
            variant={onGuests ? "tertiary" : "secondary"}
            size="s"
            prefixIcon="grid"
            aria-current={onGuests ? undefined : "page"}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            variant={onGuests ? "secondary" : "tertiary"}
            size="s"
            prefixIcon="people"
            aria-current={onGuests ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="12" vertical="center" s={{ hide: true }}>
          <Column horizontal="end" gap="2">
            <Text textVariant="label-default-s">
              {seatedCount} seated · {unseatedAttending.length} to place
            </Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {planner.name}
            </Text>
          </Column>
          <Avatar value="HB" size="s" />
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth flex={1} tabIndex={-1}>
        {children}
      </Column>
    </Column>
  );
}
