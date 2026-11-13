"use client";

import { Button, Column, Heading, Input, Row, Switch, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [product, setProduct] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToast({ tone: "success", message: "Settings saved" });
  };

  return (
    <Column as="form" onSubmit={onSubmit} gap="24" maxWidth="m">
      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Input
          id="settings-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="settings-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Your role in this workspace: {user.role}
        </Text>
      </Column>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Switch
          id="settings-digest"
          label="Weekly digest"
          description="A Monday summary of activity across your projects."
          checked={digest}
          onCheckedChange={setDigest}
        />
        <Switch
          id="settings-alerts"
          label="Issue alerts"
          description="Email me when an issue is assigned to me."
          checked={alerts}
          onCheckedChange={setAlerts}
        />
        <Switch
          id="settings-product"
          label="Product news"
          description="Occasional updates about new Lumen features."
          checked={product}
          onCheckedChange={setProduct}
        />
      </Column>

      <Row horizontal="end">
        <Button type="submit" label="Save changes" />
      </Row>
    </Column>
  );
}
