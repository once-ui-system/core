"use client";

import { Button, Column, Drawer, Input, NavItem, Row, Text } from "@once-ui-system/core";
import { useState } from "react";

export function DrawerExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        description="Narrow the list of projects."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Apply</Button>
          </>
        }
      >
        <Column gap="16" paddingTop="8">
          <Input id="drawer-owner" label="Owner" />
          <Input id="drawer-tag" label="Tag" />
        </Column>
      </Drawer>
    </>
  );
}

const SIDES = ["left", "right", "top", "bottom"] as const;

export function DrawerSidesExample() {
  const [side, setSide] = useState<(typeof SIDES)[number]>("right");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Row gap="8" wrap horizontal="center">
        {SIDES.map((option) => (
          <Button key={option} variant="secondary" onClick={() => {
              setSide(option);
              setOpen(true);
            }}>
            {option}
          </Button>
        ))}
      </Row>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        size="s"
        title={`From the ${side}`}
      >
        <Text onBackground="neutral-weak">
          Escape, the close button or a click on the overlay closes it.
        </Text>
      </Drawer>
    </>
  );
}

export function DrawerNavigationExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" prefixIcon="chevronRight" onClick={() => setOpen(true)}>
        Menu
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        size="s"
        title="Navigation"
        flush
      >
        <Column padding="8" paddingTop="64" gap="2">
          <NavItem href="#projects" icon="folder" label="Projects" selected />
          <NavItem href="#inbox" icon="inbox" label="Inbox" badge={3} />
          <NavItem href="#settings" icon="settings" label="Settings" />
        </Column>
      </Drawer>
    </>
  );
}
