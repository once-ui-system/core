"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Button, Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { C } from "./ui";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stats } = usePlan();
  const onGuests = pathname.startsWith("/guests");

  return (
    <Column fillWidth minHeight="100vh">
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
        wrap
        vertical="center"
        horizontal="between"
      >
        <Row gap="12" vertical="center">
          <Row
            width={40}
            height={40}
            radius="m"
            center
            style={{ background: C.brand, flexShrink: 0 }}
            aria-hidden="true"
          >
            <Icon name="people" size="s" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text textVariant="heading-strong-s">{APP_NAME}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
              {EVENT.name} · {EVENT.dateLabel} · {EVENT.venue}
            </Text>
          </Column>
        </Row>

        <Row as="nav" aria-label="Main" gap="4" vertical="center">
          <Button
            href="/"
            size="s"
            variant={onGuests ? "ghost" : "secondary"}
            prefixIcon="grid"
            aria-current={onGuests ? undefined : "page"}
          >
            Plan
          </Button>
          <Button
            href="/guests"
            size="s"
            variant={onGuests ? "secondary" : "ghost"}
            prefixIcon="people"
            aria-current={onGuests ? "page" : undefined}
          >
            Guests
          </Button>
        </Row>

        <Row gap="12" vertical="center">
          <Column gap="2" align="end" s={{ hide: true }}>
            <Text textVariant="label-default-s">{PLANNER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stats.seated} seated · {stats.unseatedAttending} to place
            </Text>
          </Column>
          <Avatar value={PLANNER.initials} size="s" />
        </Row>
      </Row>

      <Column as="main" id="main" fillWidth paddingX="16" paddingY="20" horizontal="center">
        <Column fillWidth maxWidth="100rem" gap="16">
          {children}
        </Column>
      </Column>
    </Column>
  );
}
