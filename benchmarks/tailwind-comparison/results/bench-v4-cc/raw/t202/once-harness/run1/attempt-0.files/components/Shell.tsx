"use client";

import { usePathname } from "next/navigation";
import {
  Avatar,
  Column,
  Heading,
  Icon,
  Row,
  Text,
  ToggleButton,
  VisuallyHidden,
} from "@once-ui-system/core";
import { APP, EVENT, PLANNER } from "@/lib/data";

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        paddingX="16"
        paddingY="8"
        gap="16"
        vertical="center"
        borderBottom
        background="page"
        position="sticky"
        top="0"
        zIndex={2}
      >
        <Row gap="12" vertical="center">
          <Row center width={32} height={32} radius="m" background="brand-alpha-weak">
            <Icon name="people" size="s" onBackground="brand-strong" />
          </Row>
          <Column gap="0">
            <Text textVariant="heading-strong-s">{APP.name}</Text>
          </Column>
        </Row>
        <Column s={{ hide: true }} m={{ hide: true }} gap="0" paddingLeft="16">
          <Text textVariant="label-strong-s">{EVENT.name}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {formatDate(EVENT.date)} · {EVENT.venue}
          </Text>
        </Column>
        <Row flex={1} horizontal="end" gap="4" as="nav" aria-label="Main">
          <ToggleButton label="Plan" prefixIcon="grid" href="/" selected={pathname === "/"} />
          <ToggleButton
            label="Guests"
            prefixIcon="people"
            href="/guests"
            selected={pathname === "/guests"}
          />
        </Row>
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Avatar value="HB" size="s" />
          <Text textVariant="label-default-s">{PLANNER.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="90rem" gap="16">
          {children}
        </Column>
      </Column>
      <Row hide>
        <Heading as="h2">{APP.tagline}</Heading>
      </Row>
    </Column>
  );
}
