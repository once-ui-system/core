"use client";

import {
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Select,
  Setting,
  Switch,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "../lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("utc");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="16">
      <Column background="surface" border radius="m" padding="16" gap="16" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Profile
        </Heading>
        <Form
          as="form"
          columns={{ xl: 2, s: 1 }}
          onSubmit={(event) => {
            event.preventDefault();
            addToast({ tone: "success", message: "Profile saved" });
          }}
        >
          <Input id="name" label="Display name" value={name} onValueChange={setName} />
          <Input id="email" label="Email" type="email" value={email} onValueChange={setEmail} />
          <Select
            id="timezone"
            label="Timezone"
            value={timezone}
            onValueChange={(value) => setTimezone(value as string)}
            options={[
              { value: "utc", label: "UTC" },
              { value: "wat", label: "West Africa Time (UTC+1)" },
              { value: "cet", label: "Central European Time (UTC+1)" },
              { value: "est", label: "Eastern Time (UTC-5)" },
            ]}
          />
          <Row gap="8">
            <Button type="submit" size="s" label="Save changes" />
            <Button
              type="button"
              size="s"
              variant="secondary"
              label="Reset"
              onClick={() => {
                setName(user.name);
                setEmail(user.email);
              }}
            />
          </Row>
        </Form>
      </Column>

      <Column background="surface" border radius="m" padding="16" gap="8" as="section">
        <Heading as="h2" textVariant="heading-strong-m">
          Notifications
        </Heading>
        <Setting label="Weekly digest" description="A summary of open issues, sent on Mondays.">
          <Switch checked={weekly} onCheckedChange={setWeekly} aria-label="Weekly digest" />
        </Setting>
        <Setting label="Mentions" description="Email me when someone mentions me on an issue.">
          <Switch checked={mentions} onCheckedChange={setMentions} aria-label="Mentions" />
        </Setting>
      </Column>

      <Column
        background="surface"
        border="danger-alpha-medium"
        radius="m"
        padding="16"
        gap="8"
        as="section"
      >
        <Heading as="h2" textVariant="heading-strong-m">
          Danger zone
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Deleting the workspace removes every project and issue permanently.
        </Text>
        <Row>
          <Button tone="danger" size="s" label="Delete workspace" />
        </Row>
      </Column>
    </Column>
  );
}
