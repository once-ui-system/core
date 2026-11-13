"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <Column gap="32" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text onBackground="neutral-weak">Your profile and notification preferences.</Text>
      </Column>

      <Column
        as="form"
        background="page"
        border
        radius="m"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Settings saved" });
        }}
      >
        <Heading as="h2" variant="heading-strong-l">
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
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Role: {user.role}
        </Text>

        <Heading as="h2" variant="heading-strong-l">
          Notifications
        </Heading>
        <Switch
          label="Weekly digest"
          description="A Monday summary of open issues and project activity."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          label="Critical issue alerts"
          description="Email me as soon as an issue is marked critical."
          checked={alerts}
          onCheckedChange={setAlerts}
        />
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>
    </Column>
  );
}
