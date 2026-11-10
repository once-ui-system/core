"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Avatar, Column, Icon, Row, Text, ToggleButton, VisuallyHidden } from "@once-ui-system/core";
import { APP_NAME, EVENT, PLANNER } from "@/lib/data";
import { formatEventDate, initials } from "@/lib/plan";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Column fillWidth flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        height="56"
        paddingX="16"
        gap="16"
        vertical="center"
        background="surface"
        borderBottom
        position="sticky"
        top="0"
        zIndex={2}>
        <Row gap="8" vertical="center" fit>
          <Row width={32} height={32} radius="m" background="brand-alpha-medium" center fit>
            <Icon name="people" size="s" onBackground="brand-strong" />
          </Row>
          <Text textVariant="heading-strong-s">{APP_NAME}</Text>
        </Row>
        <Row s={{ hide: true }} fit>
          <Column gap="2" fit>
            <Text textVariant="label-strong-s">{EVENT.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {formatEventDate(EVENT.date)} · {EVENT.venue}
            </Text>
          </Column>
        </Row>
        <Row as="nav" aria-label="Main" gap="4" marginLeft="auto" vertical="center" fit>
          <ToggleButton href="/" label="Plan" prefixIcon="grid" selected={pathname === "/"} />
          <ToggleButton href="/guests" label="Guests" prefixIcon="people" selected={pathname.startsWith("/guests")} />
        </Row>
        <Row gap="8" vertical="center" fit s={{ hide: true }}>
          <Avatar size="s" value={initials(PLANNER.name)} />
          <Text textVariant="label-default-s">{PLANNER.name}</Text>
        </Row>
      </Row>
      <Column as="main" id="main" fillWidth horizontal="center" flex={1}>
        {children}
      </Column>
    </Column>
  );
}
