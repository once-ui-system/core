"use client";

/**
 * Gold example: settings
 * Target: a vertical tab list beside the panel (above it on a phone), a
 * profile form, settings rows with one control each, a group whose
 * sub-settings sit inside it, and a danger zone.
 *
 * The section nav is `Tabs` with `orientation="vertical"`: one `TabPanel` per
 * section, so only the chosen section renders, the list gets the tab roles
 * and arrow keys, and a phone gets the list above the panel from one
 * breakpoint prop. Sections that are routes of their own use `NavItem href`
 * instead. `keepMounted` keeps the profile form's unsaved input when the
 * user looks at another tab.
 *
 * `Setting` is the row — label and description on the left, one control on
 * the right — and stacks into a panel on its own, so a list of them needs no
 * surface around it. With `control` and `open` it is a group that keeps its sub-settings inside its box,
 * which is what keeps the relationship readable in a long panel.
 */
import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  NumberInput,
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

export function SettingsExample() {
  // addToast is stable: call it from handlers and effects directly.
  const { addToast } = useToast();
  const [timezone, setTimezone] = useState("utc");
  const [updates, setUpdates] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestHour, setDigestHour] = useState(9);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" textVariant="display-strong-s">
            Manage your workspace
          </Heading>
        </Column>

        <Tabs defaultValue="profile" orientation="vertical" gap="32" s={{ direction: "column" }}>
          <TabList aria-label="Settings sections" minWidth="14rem" s={{ direction: "row" }}>
            <Tab value="profile" size="l" prefixIcon="person">
              Profile
            </Tab>
            <Tab value="notifications" size="l" prefixIcon="bell">
              Notifications
            </Tab>
            <Tab value="workspace" size="l" prefixIcon="settings">
              Workspace
            </Tab>
          </TabList>

          <TabPanel value="profile" keepMounted>
            <Column background="surface" border radius="l" padding="24" gap="24">
              <Heading as="h2" textVariant="heading-strong-m">
                Profile
              </Heading>
              <Row gap="16" vertical="center">
                <Avatar size="l" value="AP" />
                <Column gap="8">
                  <Button size="s" variant="secondary">
                    Upload photo
                  </Button>
                  <Text textVariant="label-default-s" onBackground="neutral-weak">
                    JPG or PNG, max 2 MB
                  </Text>
                </Column>
              </Row>
              <Form
                as="form"
                columns={{ xl: 2, s: 1 }}
                onSubmit={(event) => event.preventDefault()}
              >
                <Input id="name" label="Display name" />
                <Input id="email" label="Email" type="email" />
                <Select
                  id="timezone"
                  label="Timezone"
                  value={timezone}
                  onValueChange={(value) => setTimezone(value as string)}
                  options={[
                    { value: "utc", label: "UTC" },
                    { value: "cet", label: "Central European Time" },
                    { value: "est", label: "Eastern Time" },
                  ]}
                />
              </Form>
              <Row gap="12">
                <Button onClick={() => addToast({ tone: "success", message: "Profile saved" })}>
                  Save changes
                </Button>
                <Button variant="secondary">Cancel</Button>
              </Row>
            </Column>
          </TabPanel>

          <TabPanel value="notifications" gap="8">
            <Heading as="h2" textVariant="heading-strong-m" paddingBottom="8">
              Notifications
            </Heading>
            <Setting label="Product updates" description="Release notes and changelog">
              <Switch
                checked={updates}
                onCheckedChange={() => setUpdates(!updates)}
                aria-label="Product updates"
              />
            </Setting>
            <Setting
              label="Weekly digest"
              info="A summary of the week's activity, sent once."
              control={
                <Switch
                  checked={digest}
                  onCheckedChange={() => setDigest(!digest)}
                  aria-label="Weekly digest"
                />
              }
              open={digest}
            >
              <Setting label="Send at" description="Hour of the day, in your timezone">
                <NumberInput
                  id="digest-hour"
                  min={0}
                  max={23}
                  value={digestHour}
                  onValueChange={setDigestHour}
                />
              </Setting>
            </Setting>
          </TabPanel>

          <TabPanel value="workspace">
            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
            >
              <Heading as="h2" textVariant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                Permanently delete your workspace and all associated data.
              </Text>
              <Row>
                <Button tone="danger" size="s">
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </TabPanel>
        </Tabs>
      </Column>
    </Column>
  );
}
