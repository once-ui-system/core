"use client";

import {
  Column,
  Heading,
  Nav,
  NavItem,
  Row,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  Text,
  WorkspaceSwitcher,
  type WorkspaceSwitcherItem,
} from "@once-ui-system/core";
import { useState } from "react";

const own = ["Fjell", "Halden & Co", "Ember Coffee Roasters on the Old Harbour", "Lumen Studio", "Northwind"];
const platform = ["Ash & Oak", "Brightwater Yoga", "Copperline Bikes", "Driftwood Market"];
const offered = ["Sundial Bakery", "Tidepool Gallery", "Willow Rentals"];

const items: WorkspaceSwitcherItem[] = [
  ...own.map((label, i) => ({
    value: `own-${i}`,
    label,
    description: i === 0 ? "Owner" : "Admin",
    group: "own",
  })),
  ...platform.map((label, i) => ({
    value: `platform-${i}`,
    label,
    description: "Platform access",
    group: "platform",
  })),
  ...offered.map((label, i) => ({
    value: `offer-${i}`,
    label,
    description: "Waiting to be claimed",
    group: "offer",
  })),
];

const groups = [
  { id: "own", label: "Your workspaces" },
  { id: "platform", label: "Platform access" },
  { id: "offer", label: "Waiting to be claimed" },
];

export default function WorkspaceSwitcherProof() {
  const [value, setValue] = useState("own-2");
  return (
    <SidebarProvider>
      <Row fillWidth background="page" style={{ minHeight: "100vh" }}>
        <Sidebar>
          <SidebarHeader>
            <WorkspaceSwitcher
              items={items}
              groups={groups}
              value={value}
              onValueChange={setValue}
              onCreate={() => {}}
            />
          </SidebarHeader>
          <SidebarContent>
            <Nav>
              <NavItem label="Overview" icon="home" selected href="#" />
              <NavItem label="Bookings" icon="calendar" href="#" />
              <NavItem label="Settings" icon="settings" href="#" />
            </Nav>
          </SidebarContent>
        </Sidebar>
        <Column fillWidth padding="24" gap="16">
          <Row gap="8" vertical="center">
            <SidebarTrigger />
            <Heading variant="heading-strong-l">Overview</Heading>
          </Row>
          <Column fillWidth maxWidth="xs" gap="8">
            <Text onBackground="neutral-weak">On a phone the switcher sits in the header:</Text>
            <WorkspaceSwitcher
              items={items.slice(0, 4)}
              value={value}
              onValueChange={setValue}
              onCreate={() => {}}
              labels={{ title: "Venues", create: "New venue" }}
            />
          </Column>
        </Column>
      </Row>
    </SidebarProvider>
  );
}
