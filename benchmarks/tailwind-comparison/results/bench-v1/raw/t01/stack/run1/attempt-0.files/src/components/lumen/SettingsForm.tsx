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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Settings saved" });
  };

  return (
    <form onSubmit={onSubmit} aria-label="Account settings">
      <Column gap="24">
        <Column
          as="section"
          aria-labelledby="profile-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
        >
          <Heading as="h2" id="profile-heading" variant="heading-strong-m">
            Profile
          </Heading>
          <Input
            id="settings-name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            id="settings-email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Your role in this workspace: {user.role}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="notify-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
        >
          <Heading as="h2" id="notify-heading" variant="heading-strong-m">
            Notifications
          </Heading>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="weekly-label">
                Weekly summary
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                A Monday email with issues opened and closed.
              </Text>
            </Column>
            <Switch
              checked={weekly}
              onToggle={(checked) => setWeekly(checked)}
              aria-labelledby="weekly-label"
            />
          </Row>
          <Row horizontal="between" vertical="center" gap="16">
            <Column gap="4" flex={1}>
              <Text variant="label-strong-s" id="mentions-label">
                Mentions
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Notify me when someone mentions me on an issue.
              </Text>
            </Column>
            <Switch
              checked={mentions}
              onToggle={(checked) => setMentions(checked)}
              aria-labelledby="mentions-label"
            />
          </Row>
        </Column>

        <Row horizontal="end">
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>
    </form>
  );
}
