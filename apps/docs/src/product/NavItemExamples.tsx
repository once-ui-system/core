"use client";

import { Avatar, Column, NavItem } from "@once-ui-system/core";
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
    <Column maxWidth="20rem" gap="4" padding="8" radius="l" border>
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
