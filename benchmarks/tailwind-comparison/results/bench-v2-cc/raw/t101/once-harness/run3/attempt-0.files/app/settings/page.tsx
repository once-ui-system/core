"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../../lib/data";

const preferences = [
  { id: "digest", label: "Weekly digest", hint: "A summary of open issues every Monday." },
  { id: "mentions", label: "Mentions", hint: "Email me when someone mentions me." },
  { id: "status", label: "Project status changes", hint: "Tell me when a project is paused or archived." },
];

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    digest: true,
    mentions: true,
    status: false,
  });

  return (
    <Column gap="24" maxWidth="m">
      <Heading as="h1" textVariant="heading-strong-xl">
        Settings
      </Heading>

      <Column
        as="form"
        background="surface"
        border
        radius="m"
        padding="16"
        gap="16"
        onSubmit={(event: React.FormEvent) => {
          event.preventDefault();
          addToast({ variant: "success", message: "Profile saved" });
        }}
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="name"
          label="Full name"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
        />
        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Role: {user.role}
        </Text>
        <Row>
          <Button type="submit" label="Save changes" />
        </Row>
      </Column>

      <Column background="surface" border radius="m" padding="16" gap="12">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        {preferences.map((pref) => (
          <Row key={pref.id} horizontal="between" vertical="center" gap="16">
            <Column gap="2">
              <Text id={`${pref.id}-label`} textVariant="label-default-s">
                {pref.label}
              </Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {pref.hint}
              </Text>
            </Column>
            <Switch
              aria-labelledby={`${pref.id}-label`}
              checked={prefs[pref.id]}
              onCheckedChange={(checked: boolean) => setPrefs((prev) => ({ ...prev, [pref.id]: checked }))}
            />
          </Row>
        ))}
      </Column>
    </Column>
  );
}
