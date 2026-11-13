"use client";

import { Button, Column, Heading, Input, Line, Row, SegmentedControl, Switch, Tag, Text, useTheme } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

const notificationOptions = [
  { id: "digest", label: "Weekly digest", note: "A Monday summary of issues opened and closed." },
  { id: "assigned", label: "Issue assigned to me", note: "Email when someone assigns you an issue." },
  { id: "status", label: "Project status changes", note: "Email when a project is paused or archived." },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [notify, setNotify] = useState<Record<string, boolean>>({ digest: true, assigned: true, status: false });

  return (
    <>
      <Column gap="4">
        <Heading as="h1" variant="heading-strong-l">
          Settings
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Your profile, notifications and appearance.
        </Text>
      </Column>

      <Column as="section" aria-labelledby="profile" background="page" border radius="m" padding="16" gap="12">
        <Row gap="8" vertical="center">
          <Heading as="h2" id="profile" variant="heading-strong-s">
            Profile
          </Heading>
          <Tag size="s" label={user.role} />
        </Row>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <Column gap="12" maxWidth="m">
            <Input
              id="settings-name"
              label="Full name"
              size="xs"
              value={name}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
            <Input
              id="settings-email"
              label="Email"
              type="email"
              size="xs"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
                setSaved(false);
              }}
            />
            <Row gap="12" vertical="center">
              <Button type="submit" size="s" label="Save changes" />
              <Text role="status" variant="body-default-s" onBackground="neutral-weak">
                {saved ? "Saved." : ""}
              </Text>
            </Row>
          </Column>
        </form>
      </Column>

      <Column as="section" aria-labelledby="notifications" background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="notifications" variant="heading-strong-s">
          Notifications
        </Heading>
        {notificationOptions.map((option, index) => (
          <Column key={option.id} gap="12">
            {index > 0 && <Line />}
            <Row horizontal="between" vertical="center" gap="16">
              <Column gap="2">
                <Text variant="label-strong-s">{option.label}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {option.note}
                </Text>
              </Column>
              <Switch
                ariaLabel={option.label}
                checked={notify[option.id]}
                onToggle={(checked: boolean) => setNotify((state) => ({ ...state, [option.id]: checked }))}
              />
            </Row>
          </Column>
        ))}
      </Column>

      <Column as="section" aria-labelledby="appearance" background="page" border radius="m" padding="16" gap="12">
        <Heading as="h2" id="appearance" variant="heading-strong-s">
          Appearance
        </Heading>
        <Column maxWidth="s">
          <SegmentedControl
            compact
            value={theme}
            onChange={(value: string) => setTheme(value as "light" | "dark" | "system")}
            buttons={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
        </Column>
      </Column>
    </>
  );
}
