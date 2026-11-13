"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column maxWidth="m" gap="32">
        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
          <Heading as="h2" id="profile-title" variant="heading-strong-l">
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
            type="email"
            label="Email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="notify-title">
          <Heading as="h2" id="notify-title" variant="heading-strong-l">
            Notifications
          </Heading>
          <Switch
            label="Weekly report email"
            checked={weekly}
            onToggle={(value) => {
              setWeekly(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Alert me when an issue is assigned"
            checked={alerts}
            onToggle={(value) => {
              setAlerts(value);
              setSaved(false);
            }}
          />
        </Column>

        <Row gap="16" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" variant="body-default-s" onBackground="neutral-weak">
            {saved ? "Settings saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
