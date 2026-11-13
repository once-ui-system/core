"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);

  return (
    <Column
      as="form"
      gap="16"
      maxWidth="m"
      onSubmit={(event: React.FormEvent) => {
        event.preventDefault();
        addToast({ tone: "success", message: "Settings saved" });
      }}
    >
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Settings
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          Your profile and notification preferences.
        </Text>
      </Column>

      <Column as="section" aria-labelledby="profile" background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="profile" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input id="name" label="Full name" value={name} onValueChange={setName} />
        <Input id="email" label="Email" type="email" value={email} onValueChange={setEmail} />
        <Input id="role" label="Role" value={user.role} readOnly description="Only the workspace owner changes roles." />
      </Column>

      <Column as="section" aria-labelledby="notifications" background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="notifications" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="weekly"
          label="Weekly summary"
          description="A Monday email with issues opened and closed."
          checked={weekly}
          onCheckedChange={setWeekly}
        />
        <Switch
          id="assigned"
          label="Issues assigned to me"
          description="Notify me when someone assigns an issue."
          checked={assigned}
          onCheckedChange={setAssigned}
        />
        <Switch
          id="releases"
          label="Release notes"
          description="Product updates from Lumen."
          checked={releases}
          onCheckedChange={setReleases}
        />
      </Column>

      <Row gap="8">
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
