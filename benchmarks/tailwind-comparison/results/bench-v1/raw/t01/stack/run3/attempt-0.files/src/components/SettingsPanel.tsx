"use client";

import { Button, Column, Heading, Input, Row, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsPanel() {
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you informed. Your role is {user.role}.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="24">
          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Input
              id="settings-name"
              label="Full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
            <Input
              id="settings-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-m">
              Notifications
            </Heading>
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Text variant="label-default-m" id="label-digest">
                  Weekly digest
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  A Monday summary of issues opened and closed.
                </Text>
              </Column>
              <Switch
                aria-labelledby="label-digest"
                checked={digest}
                onToggle={() => {
                  setDigest((v) => !v);
                  setSaved(false);
                }}
              />
            </Row>
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="4">
                <Text variant="label-default-m" id="label-mentions">
                  Mentions
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Email me when someone mentions me on an issue.
                </Text>
              </Column>
              <Switch
                aria-labelledby="label-mentions"
                checked={mentions}
                onToggle={() => {
                  setMentions((v) => !v);
                  setSaved(false);
                }}
              />
            </Row>
          </Column>

          <Row gap="16" vertical="center">
            <Button type="submit" label="Save changes" />
            <Text variant="body-default-s" onBackground="success-medium" role="status" aria-live="polite">
              {saved ? "Changes saved" : ""}
            </Text>
          </Row>
        </Column>
      </form>
    </Column>
  );
}
