"use client";

import { Button, Column, Heading, Input, Switch, Text } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export default function Page() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Make Lumen yours: your details and the updates you like to get.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="24" maxWidth="m">
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-l">
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
            <Text variant="body-default-s" onBackground="neutral-weak">
              Your role in this workspace: {user.role}
            </Text>
          </Column>

          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-l">
              Notifications
            </Heading>
            <Switch
              label="Weekly summary"
              description="A friendly recap of what your team shipped, every Monday."
              checked={weekly}
              onToggle={(value) => {
                setWeekly(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Mentions"
              description="Hear about it when a teammate mentions you on an issue."
              checked={mentions}
              onToggle={(value) => {
                setMentions(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Product news"
              description="New features and tips from the Lumen team."
              checked={releases}
              onToggle={(value) => {
                setReleases(value);
                setSaved(false);
              }}
            />
          </Column>

          <Column gap="12" horizontal="start">
            <Button type="submit" size="l" label="Save changes" />
            <Text role="status" aria-live="polite" variant="body-default-s" onBackground="success-strong">
              {saved ? "Saved. Your settings are up to date." : ""}
            </Text>
          </Column>
        </Column>
      </form>
    </>
  );
}
