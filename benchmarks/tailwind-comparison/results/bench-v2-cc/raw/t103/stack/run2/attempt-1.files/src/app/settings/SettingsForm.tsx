"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column maxWidth="m" gap="24">
        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-s">
            Profile
          </Heading>
          <Input
            id="name"
            label="Full name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Role: {user.role}
          </Text>
        </Column>

        <Column background="neutral-alpha-weak" border radius="m" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-s">
            Notifications
          </Heading>
          <Switch
            label="Weekly digest"
            description="A summary of open issues every Monday."
            checked={digest}
            onToggle={(value) => {
              setDigest(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Mentions"
            description="Email me when someone mentions me in an issue."
            checked={mentions}
            onToggle={(value) => {
              setMentions(value);
              setSaved(false);
            }}
          />
        </Column>

        <Row gap="12" vertical="center">
          <Button type="submit" label="Save changes" />
          <Text role="status" variant="body-default-s" onBackground="success-strong">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
