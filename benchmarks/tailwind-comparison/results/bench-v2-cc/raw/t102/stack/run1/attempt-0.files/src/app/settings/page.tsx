"use client";

import { useState } from "react";
import {
  Button,
  Column,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Switch,
  Tag,
  Text,
  useTheme,
} from "@once-ui-system/core";
import { user } from "@/lib/data";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Settings
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Manage your profile and how Lumen keeps you in the loop.
        </Text>
      </Column>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <Column gap="32" maxWidth="m">
          <Column background="page" border radius="l" padding="24" gap="24">
            <Row horizontal="between" vertical="center" gap="16" wrap>
              <Heading as="h2" variant="heading-strong-xl">
                Profile
              </Heading>
              <Tag size="m" scheme="brand" label={user.role} />
            </Row>
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
              type="email"
              label="Email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="page" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-xl">
              Notifications
            </Heading>
            <Switch
              label="Weekly digest"
              description="A friendly summary of progress every Monday."
              ariaLabel="Weekly digest"
              checked={digest}
              onToggle={(value) => {
                setDigest(value);
                setSaved(false);
              }}
            />
            <Switch
              label="Mentions"
              description="Tell me when a teammate mentions me on an issue."
              ariaLabel="Mentions"
              checked={mentions}
              onToggle={(value) => {
                setMentions(value);
                setSaved(false);
              }}
            />
          </Column>

          <Column background="page" border radius="l" padding="24" gap="16">
            <Heading as="h2" variant="heading-strong-xl">
              Appearance
            </Heading>
            <SegmentedControl
              buttons={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "system" },
              ]}
              value={theme}
              onChange={(value) => setTheme(value as "light" | "dark" | "system")}
            />
          </Column>

          <Row gap="16" vertical="center" wrap>
            <Button type="submit" label="Save changes" />
            <Text role="status" aria-live="polite" variant="body-default-m" onBackground="neutral-weak">
              {saved ? "Saved. Looking good!" : ""}
            </Text>
          </Row>
        </Column>
      </form>
    </>
  );
}
