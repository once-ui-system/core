"use client";

import { Avatar, Column, Nav, NavItem, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

const people = [
  { id: "ada", name: "Ada Lovelace", src: "/images/avatars/01.png", unread: 3 },
  { id: "alan", name: "Alan Turing", src: "/images/avatars/02.png", unread: 0 },
  { id: "grace", name: "Grace Hopper", src: "/images/avatars/03.png", unread: 12 },
];

/** NavItem rows for people, each with an avatar in the `prefix` slot. */
export function NavItemAvatarExample() {
  const [current, setCurrent] = useState("ada");
  return (
    <Column maxWidth={20} gap="4" padding="8" radius="l" border>
      {people.map((person) => (
        <NavItem
          key={person.id}
          label={person.name}
          prefix={<Avatar size="xs" src={person.src} />}
          badge={person.unread}
          selected={person.id === current}
          onClick={() => setCurrent(person.id)}
        />
      ))}
    </Column>
  );
}

const railTabs = [
  { id: "pages", icon: "pages", label: "Pages" },
  { id: "layouts", icon: "grid", label: "Layouts" },
  { id: "components", icon: "sparkle", label: "Components" },
  { id: "settings", icon: "settings", label: "Settings" },
] as const;

/** An editor's icon rail that opens over the panel beside it on hover. */
export function NavRailExample() {
  const [current, setCurrent] = useState("layouts");
  return (
    <Row fillWidth height={24} radius="l" border overflow="hidden">
      <Nav
        aria-label="Editor"
        collapsed
        expandOnHover
        expandedWidth={12}
        padding="8"
        radius="l"
        borderRight
      >
        {railTabs.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            selected={tab.id === current}
            onClick={() => setCurrent(tab.id)}
          />
        ))}
      </Nav>
      <Column fill padding="24" gap="8" background="surface">
        <Text variant="heading-strong-s">{railTabs.find((tab) => tab.id === current)?.label}</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Hover the rail. It opens over this panel, which stays where it is.
        </Text>
      </Column>
    </Row>
  );
}
