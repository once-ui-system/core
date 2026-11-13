"use client";

import { useState } from "react";
import { Button, Column, Heading, Input, Row, Switch, Tag, Text } from "@once-ui-system/core";
import { user } from "@/lib/data";

export function SettingsForm() {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [workspace, setWorkspace] = useState("Acme Labs");
  const [weekly, setWeekly] = useState(true);
  const [assigned, setAssigned] = useState(true);
  const [releases, setReleases] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <Column gap="16" maxWidth="m">
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Row vertical="center" gap="8">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Tag as="span" size="s" label={user.role} />
          </Row>
          <Input
            id="settings-name"
            label="Full name"
            size="xs"
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
            size="xs"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
          />
        </Column>
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Heading as="h2" variant="heading-strong-m">
            Workspace
          </Heading>
          <Input
            id="settings-workspace"
            label="Workspace name"
            size="xs"
            value={workspace}
            onChange={(event) => {
              setWorkspace(event.target.value);
              setSaved(false);
            }}
          />
        </Column>
        <Column background="surface" border radius="s" padding="16" gap="12">
          <Heading as="h2" variant="heading-strong-m">
            Notifications
          </Heading>
          <Switch
            label="Weekly summary"
            description="A digest of issue activity every Monday."
            checked={weekly}
            onToggle={(value) => {
              setWeekly(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Assigned to me"
            description="Email when an issue is assigned to you."
            checked={assigned}
            onToggle={(value) => {
              setAssigned(value);
              setSaved(false);
            }}
          />
          <Switch
            label="Release notes"
            description="Product updates from the Lumen team."
            checked={releases}
            onToggle={(value) => {
              setReleases(value);
              setSaved(false);
            }}
          />
        </Column>
        <Row gap="12" vertical="center">
          <Button type="submit" size="s" label="Save changes" />
          <Text role="status" aria-live="polite" variant="body-default-s" onBackground="neutral-weak">
            {saved ? "Changes saved." : ""}
          </Text>
        </Row>
      </Column>
    </form>
  );
}
