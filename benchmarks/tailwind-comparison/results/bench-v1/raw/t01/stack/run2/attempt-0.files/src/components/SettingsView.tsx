"use client";

import {
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Setting,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useState } from "react";
import { user } from "@/lib/data";

export function SettingsView() {
  const { addToast } = useToast();
  const [name, setName] = useState<string>(user.name);
  const [email, setEmail] = useState<string>(user.email);
  const [issueAlerts, setIssueAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  return (
    <Column gap="24">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          Workspace
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Settings
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Signed in as {user.email} ({user.role}).
        </Text>
      </Column>

      <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
        <TabList aria-label="Settings sections" minWidth={14} s={{ direction: "row" }}>
          <Tab value="profile" prefixIcon="person">
            Profile
          </Tab>
          <Tab value="notifications" prefixIcon="bell">
            Notifications
          </Tab>
        </TabList>

        <TabPanel value="profile" keepMounted flex={1}>
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" variant="heading-strong-m">
              Profile
            </Heading>
            <Form
              as="form"
              columns={{ xl: 2, s: 1 }}
              onSubmit={(event) => {
                event.preventDefault();
                addToast({ variant: "success", message: "Profile saved" });
              }}
            >
              <Input
                id="name"
                label="Display name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Row gap="12" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" label="Save changes" />
              </Row>
            </Form>
          </Column>
        </TabPanel>

        <TabPanel value="notifications" flex={1} gap="8">
          <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
            Notifications
          </Heading>
          <Setting
            label="Issue alerts"
            description="Email me when an issue assigned to me changes status."
          >
            <Switch
              checked={issueAlerts}
              onToggle={(checked) => setIssueAlerts(checked)}
              ariaLabel="Issue alerts"
            />
          </Setting>
          <Setting
            label="Weekly digest"
            description="A Monday summary of open issues and project activity."
          >
            <Switch
              checked={weeklyDigest}
              onToggle={(checked) => setWeeklyDigest(checked)}
              ariaLabel="Weekly digest"
            />
          </Setting>
        </TabPanel>
      </Tabs>
    </Column>
  );
}
