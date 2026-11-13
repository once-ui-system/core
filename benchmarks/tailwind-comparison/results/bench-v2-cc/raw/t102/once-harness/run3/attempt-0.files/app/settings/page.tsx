"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Make Lumen feel like home for you and your team.
        </Text>
      </Column>
      <Column
        as="form"
        maxWidth="m"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="24"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ tone: "success", message: "Settings saved" });
        }}
      >
        <Heading as="h2" textVariant="heading-strong-l">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Text onBackground="neutral-weak">Role: {user.role}</Text>
        <Heading as="h2" textVariant="heading-strong-l">
          Notifications
        </Heading>
        <Row vertical="center" horizontal="between" gap="16">
          <Text id="digest-label">Weekly digest email</Text>
          <Switch aria-labelledby="digest-label" checked={digest} onCheckedChange={setDigest} />
        </Row>
        <Row vertical="center" horizontal="between" gap="16">
          <Text id="mentions-label">Notify me when I am mentioned</Text>
          <Switch aria-labelledby="mentions-label" checked={mentions} onCheckedChange={setMentions} />
        </Row>
        <Row>
          <Button type="submit" size="l">
            Save changes
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
