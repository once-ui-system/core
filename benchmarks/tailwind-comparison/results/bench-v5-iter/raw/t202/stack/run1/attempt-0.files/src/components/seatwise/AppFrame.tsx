"use client";

import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { app, event, planner } from "@/lib/data";
import { useSeating } from "@/lib/seating";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { notice } = useSeating();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth horizontal="center" paddingX="16" paddingY="16" gap="16">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column fillWidth maxWidth="90rem" gap="16">
        <Row
          as="header"
          fillWidth
          horizontal="between"
          vertical="center"
          gap="16"
          paddingX="16"
          paddingY="12"
          background="surface"
          border
          radius="l"
          wrap
        >
          <Row gap="12" vertical="center">
            <Row center width="40" height="40" radius="m" solid="brand-strong">
              <Icon name="people" onSolid="brand-strong" />
            </Row>
            <Column>
              <Text variant="heading-strong-m">{app}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {event.venue}
              </Text>
            </Column>
          </Row>

          <Row as="nav" aria-label="Main" gap="4">
            <Button
              href="/"
              size="s"
              prefixIcon="grid"
              variant={onGuests ? "tertiary" : "secondary"}
              aria-current={onGuests ? undefined : "page"}
            >
              Plan
            </Button>
            <Button
              href="/guests"
              size="s"
              prefixIcon="people"
              variant={onGuests ? "secondary" : "tertiary"}
              aria-current={onGuests ? "page" : undefined}
            >
              Guests
            </Button>
          </Row>

          <Row gap="8" vertical="center" s={{ hide: true }}>
            <Avatar size="s" value="HB" />
            <Column>
              <Text variant="label-default-s">{planner.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Planner
              </Text>
            </Column>
          </Row>
        </Row>

        <Column as="main" id="main" fillWidth gap="16">
          {children}
        </Column>
        <VisuallyHidden as="div" aria-live="polite" role="status">
          {notice}
        </VisuallyHidden>
      </Column>
    </Column>
  );
}
