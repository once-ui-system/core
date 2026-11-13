"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsClient() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} onChange={() => setSaved(false)}>
      <Column gap="24">
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16" as="section" aria-labelledby="profile">
          <Heading as="h2" id="profile" variant="heading-strong-m">
            Profile
          </Heading>
          <Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16" as="section" aria-labelledby="notifications">
          <Heading as="h2" id="notifications" variant="heading-strong-m">
            Notifications
          </Heading>
          <Switch
            checked={digest}
            onToggle={setDigest}
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
            ariaLabel="Weekly digest"
          />
          <Switch
            checked={mentions}
            onToggle={setMentions}
            label="Mentions"
            description="Email me when someone mentions me on an issue."
            ariaLabel="Mentions"
          />
        </Column>
        <Row gap="16" vertical="center" wrap>
          <Button type="submit" label="Save changes" />
          <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
            {saved ? "Settings saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
