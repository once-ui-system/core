"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);

  return (
    <>
      <PageTitle title="Settings" description="Your profile and notification preferences." />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Settings saved" });
        }}
      >
        <Column gap="16" maxWidth="m">
          <Column background="page" border radius="m" padding="16" gap="12">
            <Heading as="h2" variant="heading-strong-s">
              Profile
            </Heading>
            <Input
              id="name"
              label="Full name"
              size="xs"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              size="xs"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Text variant="body-default-s" onBackground="neutral-weak">
              Role: {user.role}
            </Text>
          </Column>
          <Column background="page" border radius="m" padding="16" gap="12">
            <Heading as="h2" variant="heading-strong-s">
              Notifications
            </Heading>
            <Switch
              label="Weekly digest"
              description="A Monday summary of issues opened and closed."
              checked={digest}
              onToggle={setDigest}
            />
            <Switch
              label="Status alerts"
              description="Tell me when a project is paused or archived."
              checked={alerts}
              onToggle={setAlerts}
            />
          </Column>
          <Row>
            <Button type="submit" size="s" label="Save changes" />
          </Row>
        </Column>
      </form>
    </>
  );
}
