"use client";

import { Button, Column, Heading, Input, Row, Switch, Tag, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addToast({ variant: "success", message: "Settings saved." });
  };

  return (
    <Column as="form" gap="24" maxWidth="m" onSubmit={onSubmit} aria-label="Account settings">
      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
        <Row horizontal="between" vertical="center" gap="12" wrap>
          <Heading as="h2" id="profile-title" textVariant="heading-strong-m">
            Profile
          </Heading>
          <Tag tone="brand" size="s" label={user.role} />
        </Row>
        <Input id="settings-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          id="settings-email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="20" as="section" aria-labelledby="notify-title">
        <Column gap="4">
          <Heading as="h2" id="notify-title" textVariant="heading-strong-m">
            Notifications
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose which updates reach your inbox.
          </Text>
        </Column>
        <Switch
          id="notify-weekly"
          label="Weekly analytics summary"
          description="A Monday email with last week's key numbers."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="notify-mentions"
          label="Mentions and assignments"
          description="Get notified when someone assigns or mentions you on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          id="notify-digest"
          label="Daily issue digest"
          description="One email each evening listing issues that changed."
          checked={digest}
          onCheckedChange={setDigest}
        />
      </Column>

      <Row gap="12" horizontal="end">
        <Button type="submit" label="Save changes" prefixIcon="check" />
      </Row>
    </Column>
  );
}
