"use client";

import { Avatar, Column, Heading, Row, Text, ToggleButton, VisuallyHidden } from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { APP_NAME, PLANNER, initials } from "@/lib/data";
import { PlanProvider } from "@/lib/PlanContext";

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <PlanProvider>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Column fillWidth>
        <Row
          as="header"
          fillWidth
          height="56"
          paddingX="16"
          gap="16"
          vertical="center"
          borderBottom
          background="surface"
        >
          <Row gap="8" vertical="center">
            <Row
              width="32"
              height="32"
              radius="m"
              background="brand-medium"
              center
              aria-hidden="true"
            >
              <Text textVariant="label-strong-m" onBackground="brand-strong">
                S
              </Text>
            </Row>
            <Heading as="p" textVariant="heading-strong-m">
              {APP_NAME}
            </Heading>
          </Row>
          <Row as="nav" aria-label="Main" gap="4" marginLeft="8">
            <ToggleButton
              href="/"
              label="Plan"
              prefixIcon="grid"
              selected={pathname === "/"}
              aria-current={pathname === "/" ? "page" : undefined}
            />
            <ToggleButton
              href="/guests"
              label="Guests"
              prefixIcon="people"
              selected={pathname === "/guests"}
              aria-current={pathname === "/guests" ? "page" : undefined}
            />
          </Row>
          <Row flex={1} />
          <Row gap="12" vertical="center">
            <Column gap="2" horizontal="end" s={{ hide: true }}>
              <Text textVariant="label-strong-s">{PLANNER.name}</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Event planner
              </Text>
            </Column>
            <Avatar size="s" value={initials(PLANNER.name)} />
          </Row>
        </Row>
        <Column as="main" id="main" fillWidth horizontal="center">
          {children}
        </Column>
      </Column>
    </PlanProvider>
  );
}
