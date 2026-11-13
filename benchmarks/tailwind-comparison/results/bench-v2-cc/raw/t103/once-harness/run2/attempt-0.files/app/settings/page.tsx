"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column fillWidth gap="32" maxWidth="m">
      <PageHeader title="Settings" description="Your profile and how Lumen keeps you informed." />

      <Column
        as="form"
        aria-labelledby="profile"
        background="surface"
        border
        radius="m"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ tone: "success", message: "Profile saved" });
        }}
      >
        <Heading as="h2" id="profile" textVariant="heading-strong-s">
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
        <Row vertical="center" gap="8">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Role
          </Text>
          <Text textVariant="code-default-s">{user.role}</Text>
        </Row>
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>

      <Column as="section" aria-labelledby="notifications" background="surface" border radius="m" padding="24" gap="16">
        <Heading as="h2" id="notifications" textVariant="heading-strong-s">
          Notifications
        </Heading>
        <Switch
          id="digest"
          label="Weekly issue digest"
          description="A Monday summary of what changed across your projects."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="mentions"
          label="Mentions and assignments"
          description="Email me when someone assigns or mentions me on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="releases"
          label="Release announcements"
          description="Product updates from the Lumen team."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>
    </Column>
  );
}
