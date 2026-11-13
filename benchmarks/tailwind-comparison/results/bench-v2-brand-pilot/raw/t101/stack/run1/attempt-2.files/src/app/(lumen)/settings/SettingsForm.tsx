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
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsForm() {
  const { addToast } = useToast();
  const [timezone, setTimezone] = useState("utc");
  const [weekly, setWeekly] = useState(true);
  const [mentions, setMentions] = useState(true);

  return (
    <Column gap="16">
      <Column background="surface" border radius="l" padding="16" gap="16">
        <Heading as="h2" variant="heading-strong-m">
          Profile
        </Heading>
        <Form
          as="form"
          size="s"
          columns={{ xl: 2, s: 1 }}
          onSubmit={(event) => {
            event.preventDefault();
            addToast({ variant: "success", message: "Profile saved" });
          }}
        >
          <Input id="name" label="Display name" defaultValue={user.name} />
          <Input id="email" label="Email" type="email" defaultValue={user.email} />
          <Input id="role" label="Role" defaultValue={user.role} disabled />
          <Select
            id="timezone"
            label="Timezone"
            value={timezone}
            onSelect={(value) => setTimezone(value as string)}
            options={[
              { value: "utc", label: "UTC" },
              { value: "cet", label: "Central European Time" },
              { value: "est", label: "Eastern Time" },
            ]}
          />
          <Row gap="8">
            <Button type="submit" size="s">
              Save changes
            </Button>
            <Button type="reset" size="s" variant="secondary">
              Cancel
            </Button>
          </Row>
        </Form>
      </Column>

      <Column gap="8">
        <Heading as="h2" variant="heading-strong-m">
          Notifications
        </Heading>
        <Setting label="Weekly digest" description="A summary of issues opened and closed, sent on Mondays">
          <Switch checked={weekly} onToggle={setWeekly} ariaLabel="Weekly digest" />
        </Setting>
        <Setting label="Mentions" description="Email me when someone mentions me on an issue">
          <Switch checked={mentions} onToggle={setMentions} ariaLabel="Mentions" />
        </Setting>
      </Column>
    </Column>
  );
}
