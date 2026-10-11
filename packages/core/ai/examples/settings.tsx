"use client";

/**
 * Gold example: settings
 * Target: section nav beside the panel, a profile form, settings rows with one
 * control each, a group whose sub-settings sit inside it, and a danger zone.
 *
 * `Setting` is the row — label and description on the left, one control on
 * the right — and stacks into a panel on its own, so a list of them needs no
 * surface around it. `SettingGroup` keeps its sub-settings inside its box,
 * which is what keeps the relationship readable in a long panel.
 */
import {
  Avatar,
  Button,
  Column,
  Form,
  Heading,
  Input,
  NavItem,
  NumberInput,
  Row,
  Select,
  Setting,
  SettingGroup,
  Switch,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const sections = [
  { id: "profile", label: "Profile", icon: "person" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "billing", label: "Billing", icon: "payment" },
  { id: "security", label: "Security", icon: "security" },
] as const;

export function SettingsExample() {
  const [section, setSection] = useState<string>("profile");
  const [timezone, setTimezone] = useState("utc");
  const [updates, setUpdates] = useState(true);
  const [digest, setDigest] = useState(true);
  const [digestHour, setDigestHour] = useState(9);

  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Manage your workspace
          </Heading>
        </Column>

        <Row fillWidth gap="32" s={{ direction: "column" }}>
          <Column as="nav" gap="4" minWidth={14}>
            {sections.map((item) => (
              <NavItem
                key={item.id}
                label={item.label}
                icon={item.icon}
                selected={section === item.id}
                onClick={() => setSection(item.id)}
              />
            ))}
          </Column>

          <Column flex={1} gap="32">
            <Column background="surface" border radius="l" padding="24" gap="24">
              <Heading as="h2" variant="heading-strong-m">
                Profile
              </Heading>
              <Row gap="16" vertical="center">
                <Avatar size="l" value="AP" />
                <Column gap="8">
                  <Button size="s" variant="secondary">
                    Upload photo
                  </Button>
                  <Text variant="label-default-s" onBackground="neutral-weak">
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
                  onSelect={(value) => setTimezone(value as string)}
                  options={[
                    { value: "utc", label: "UTC" },
                    { value: "cet", label: "Central European Time" },
                    { value: "est", label: "Eastern Time" },
                  ]}
                />
              </Form>
              <Row gap="12">
                <Button>Save changes</Button>
                <Button variant="secondary">Cancel</Button>
              </Row>
            </Column>

            <Column gap="8">
              <Heading as="h2" variant="heading-strong-m" paddingBottom="8">
                Notifications
              </Heading>
              <Setting label="Product updates" description="Release notes and changelog">
                <Switch
                  checked={updates}
                  onToggle={() => setUpdates(!updates)}
                  ariaLabel="Product updates"
                />
              </Setting>
              <SettingGroup
                label="Weekly digest"
                info="A summary of the week's activity, sent once."
                control={
                  <Switch
                    checked={digest}
                    onToggle={() => setDigest(!digest)}
                    ariaLabel="Weekly digest"
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
                    onChange={setDigestHour}
                  />
                </Setting>
              </SettingGroup>
            </Column>

            <Column
              background="surface"
              border="danger-alpha-medium"
              radius="l"
              padding="24"
              gap="16"
            >
              <Heading as="h2" variant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Permanently delete your workspace and all associated data.
              </Text>
              <Row>
                <Button variant="danger" size="s">
                  Delete workspace
                </Button>
              </Row>
            </Column>
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
