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
  const [releases, setReleases] = useState(false);

  const nameError = name.trim().length === 0;
  const emailError = !/^\S+@\S+\.\S+$/.test(email);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || emailError) return;
    addToast({ tone: "success", message: "Settings saved" });
  }

  return (
    <Column as="form" gap="24" onSubmit={onSubmit} noValidate>
      <Column
        as="section"
        aria-labelledby="profile-heading"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="20"
      >
        <Column gap="4">
          <Heading as="h2" id="profile-heading" textVariant="heading-strong-l">
            Profile
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Your role in this workspace is {user.role}.
          </Text>
        </Column>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
          errorMessage={nameError ? "Enter your name" : undefined}
        />
        <Input
          id="settings-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          errorMessage={emailError ? "Enter a valid email address" : undefined}
        />
      </Column>

      <Column
        as="section"
        aria-labelledby="notify-heading"
        background="surface"
        border
        radius="l"
        padding="24"
        gap="20"
      >
        <Column gap="4">
          <Heading as="h2" id="notify-heading" textVariant="heading-strong-l">
            Notifications
          </Heading>
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            Choose which emails Lumen sends to {email || "you"}.
          </Text>
        </Column>
        <Switch
          label="Weekly analytics digest"
          description="A Monday summary of usage and issue trends."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          label="Mentions and assignments"
          description="Get notified when someone assigns or mentions you on an issue."
          checked={mentions}
          onCheckedChange={setMentions}
        />
        <Switch
          label="Product release notes"
          description="Occasional news about new Lumen features."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row horizontal="end">
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
