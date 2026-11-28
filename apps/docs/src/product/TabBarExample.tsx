"use client";

import { Column, Heading, Row, TabBar, TabBarItem, Text } from "@once-ui-system/core";
import { useState } from "react";

const PLACES = [
  { id: "overview", icon: "home", label: "Overview" },
  { id: "clients", icon: "people", label: "Clients" },
  { id: "projects", icon: "folder", label: "Projects" },
  { id: "inbox", icon: "inbox", label: "Inbox", badge: 3 },
  { id: "more", icon: "moreHorizontal", label: "More" },
] as const;

/**
 * A phone-sized frame with a TabBar along its bottom edge. The bar is fixed to
 * the viewport in an app; the frame's transform makes it the bar's containing
 * block here, so the demo stays inside the docs page.
 */
export function TabBarExample() {
  const [current, setCurrent] = useState<string>("overview");
  const place = PLACES.find((p) => p.id === current) ?? PLACES[0];
  return (
    <Column
      fillWidth
      maxWidth="22rem"
      height="32rem"
      radius="xl"
      border="neutral-alpha-medium"
      background="page"
      overflow="hidden"
      style={{ transform: "translateZ(0)" }}
    >
      <Column fillWidth flex={1} padding="24" gap="8" overflowY="auto">
        <Heading as="h3" textVariant="heading-strong-l">
          {place.label}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Tap a tab: the current one sits on a soft tile.
        </Text>
        <Row fillWidth height="8rem" radius="l" background="neutral-alpha-weak" marginTop="16" />
        <Row fillWidth height="5rem" radius="l" background="neutral-alpha-weak" />
      </Column>
      <TabBar aria-label="Product" showBelow={false} spacer>
        {PLACES.map((p) => (
          <TabBarItem
            key={p.id}
            icon={p.icon}
            label={p.label}
            badge={"badge" in p ? p.badge : undefined}
            selected={current === p.id}
            onClick={() => setCurrent(p.id)}
          />
        ))}
      </TabBar>
    </Column>
  );
}
