"use client";

import { useState, type FormEvent } from "react";
import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function Page() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addToast({ variant: "success", message: "Settings saved" });
  }

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Your profile and how Lumen keeps you posted. Role: {user.role}.
        </Text>
      </Column>
      <form onSubmit={onSubmit}>
        <Column gap="24" maxWidth="m">
          <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="profile-title">
            <Heading as="h2" id="profile-title" variant="heading-strong-l">
              Profile
            </Heading>
            <Input id="name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Column>
          <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="notify-title">
            <Heading as="h2" id="notify-title" variant="heading-strong-l">
              Notifications
            </Heading>
            <Row horizontal="between" vertical="center" gap="16">
              <Text id="digest-label" variant="body-default-m">Weekly digest</Text>
              <Switch aria-labelledby="digest-label" checked={digest} onToggle={setDigest} />
            </Row>
            <Row horizontal="between" vertical="center" gap="16">
              <Text id="mentions-label" variant="body-default-m">Mentions and assignments</Text>
              <Switch aria-labelledby="mentions-label" checked={mentions} onToggle={setMentions} />
            </Row>
          </Column>
          <Row>
            <Button type="submit" label="Save changes" size="l" />
          </Row>
        </Column>
      </form>
    </Column>
  );
}
