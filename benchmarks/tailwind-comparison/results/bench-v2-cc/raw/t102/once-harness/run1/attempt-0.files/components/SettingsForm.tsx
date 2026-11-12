"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column
      as="form"
      gap="32"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        addToast({ variant: "success", message: "Settings saved" });
      }}
    >
      <Column background="surface" border radius="l" padding="24" gap="20">
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
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Your role in this workspace: {user.role}
        </Text>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-l">
          Notifications
        </Heading>
        <Switch
          id="weekly"
          label="Weekly digest"
          description="A friendly summary of what your team shipped."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="mentions"
          label="Mentions"
          description="Tell me when someone mentions me on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="releases"
          label="Product news"
          description="New Lumen features and tips."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row>
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
