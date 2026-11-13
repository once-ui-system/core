"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Column fillWidth gap="24" maxWidth="m">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Settings
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Your profile and notification preferences.
        </Text>
      </Column>

      <Column
        as="form"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
        />
        <Input
          id="settings-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
          }}
        />
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Role: {user.role}
        </Text>
        <Row gap="16" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" textVariant="body-default-s" onBackground="neutral-weak">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Row horizontal="between" vertical="center" gap="16">
          <Column gap="4">
            <Text textVariant="label-strong-m">Weekly digest</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              A Monday summary of issues and activity.
            </Text>
          </Column>
          <Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />
        </Row>
        <Row horizontal="between" vertical="center" gap="16">
          <Column gap="4">
            <Text textVariant="label-strong-m">Regression alerts</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Email me when a release raises the error rate.
            </Text>
          </Column>
          <Switch aria-label="Regression alerts" checked={alerts} onCheckedChange={setAlerts} />
        </Row>
      </Column>
    </Column>
  );
}
