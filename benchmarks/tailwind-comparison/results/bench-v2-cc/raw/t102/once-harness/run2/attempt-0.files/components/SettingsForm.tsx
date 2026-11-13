"use client";

import { Button, Column, Heading, Input, Switch, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column
      as="form"
      fillWidth
      maxWidth="m"
      gap="24"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        addToast({ tone: "success", message: "Settings saved" });
      }}
    >
      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="digest"
          label="Weekly digest"
          description="A friendly summary of your projects every Monday."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="mentions"
          label="Mentions"
          description="Get an email when a teammate mentions you."
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

      <Button type="submit" label="Save changes" />
    </Column>
  );
}
