"use client";

import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  Row,
  Select,
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
import { PageHeader } from "../../components/PageHeader";
import { user } from "../../lib/data";

export default function SettingsPage() {
  const { addToast } = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState("wat");
  const [mentions, setMentions] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestDay, setDigestDay] = useState("monday");
  const [releases, setReleases] = useState(false);

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Make Lumen feel like yours: your profile, and how we keep you in the loop."
      />

      <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
        <TabList aria-label="Settings sections" minWidth="14rem" s={{ direction: "row" }}>
          <Tab value="profile" size="l" prefixIcon="person">
            Profile
          </Tab>
          <Tab value="notifications" size="l" prefixIcon="bell">
            Notifications
          </Tab>
        </TabList>

        <TabPanel value="profile" keepMounted flex={1}>
          <Column background="surface" border radius="l" padding="24" gap="24">
            <Heading as="h2" textVariant="heading-strong-l">
              Your profile
            </Heading>
            <Row gap="16" vertical="center">
              <Avatar size="l" value="MO" />
              <Column gap="4">
                <Text textVariant="label-strong-m">{user.name}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {user.role} of Acme Labs
                </Text>
              </Column>
            </Row>
            <Form
              as="form"
              columns={{ xl: 2, s: 1 }}
              onSubmit={(event) => {
                event.preventDefault();
                addToast({ tone: "success", message: "Profile saved. Looking good!" });
              }}
            >
              <Input id="name" label="Display name" value={name} onValueChange={setName} />
              <Input
                id="email"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
              />
              <Select
                id="timezone"
                label="Timezone"
                value={timezone}
                onValueChange={(value) => setTimezone(value as string)}
                options={[
                  { value: "wat", label: "West Africa Time (Lagos)" },
                  { value: "cet", label: "Central European Time" },
                  { value: "est", label: "Eastern Time" },
                ]}
              />
              <Row gap="12" style={{ gridColumn: "1 / -1" }}>
                <Button type="submit" label="Save changes" />
                <Button
                  type="button"
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
        </TabPanel>

        <TabPanel value="notifications" flex={1} gap="8">
          <Heading as="h2" textVariant="heading-strong-l" marginBottom="8">
            Notifications
          </Heading>
          <Setting label="Mentions" description="Tell me when a teammate mentions me">
            <Switch
              checked={mentions}
              onCheckedChange={setMentions}
              aria-label="Mention notifications"
            />
          </Setting>
          <Setting
            label="Weekly digest"
            info="A friendly summary of what your team shipped."
            control={
              <Switch checked={digest} onCheckedChange={setDigest} aria-label="Weekly digest" />
            }
            open={digest}
          >
            <Setting label="Send on" description="Day of the week">
              <Select
                id="digest-day"
                label="Day"
                value={digestDay}
                onValueChange={(value) => setDigestDay(value as string)}
                options={[
                  { value: "monday", label: "Monday" },
                  { value: "friday", label: "Friday" },
                ]}
              />
            </Setting>
          </Setting>
          <Setting label="Product releases" description="News when Lumen ships something new">
            <Switch
              checked={releases}
              onCheckedChange={setReleases}
              aria-label="Product release news"
            />
          </Setting>
        </TabPanel>
      </Tabs>
    </Column>
  );
}
