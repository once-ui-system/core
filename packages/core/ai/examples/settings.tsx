"use client";

/**
 * Gold example: settings
 * Target: split layout with sidebar nav, profile form sections, danger zone
 */
import {
  Avatar,
  Button,
  Checkbox,
  Column,
  Heading,
  Input,
  Line,
  Row,
  Select,
  SplitView,
  Switch,
  Text,
} from "@once-ui-system/core";

const sections = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
];

export function SettingsExample() {
  return (
    <Column as="main" fillWidth horizontal="center" paddingY="48" paddingX="24">
      <Column fillWidth maxWidth="l" gap="40">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-medium">
            Settings
          </Text>
          <Heading as="h1" variant="display-strong-s">
            Manage your workspace
          </Heading>
        </Column>

        <SplitView fillWidth minHeight={48}>
          <Column
            width={20}
            gap="4"
            padding="16"
            background="surface"
            border="neutral-alpha-weak"
            radius="l"
            s={{ hide: true }}
          >
            {sections.map((section, index) => (
              <Row
                key={section.id}
                padding="12"
                radius="m"
                background={index === 0 ? "neutral-alpha-weak" : undefined}
                textVariant="label-default-s"
                cursor="interactive"
              >
                {section.label}
              </Row>
            ))}
          </Column>

          <Column flex={1} gap="24">
            <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="24">
              <Heading as="h2" variant="heading-strong-m">
                Profile
              </Heading>
              <Row gap="16" vertical="center">
                <Avatar size="l" value="LO" />
                <Column gap="8">
                  <Button size="s" variant="secondary">
                    Upload photo
                  </Button>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    JPG or PNG, max 2 MB
                  </Text>
                </Column>
              </Row>
              <Input id="name" label="Display name" placeholder="Lorant One" />
              <Input id="email" label="Email" placeholder="you@company.com" />
              <Select
                id="timezone"
                label="Timezone"
                options={[
                  { value: "utc", label: "UTC" },
                  { value: "est", label: "Eastern Time" },
                ]}
              />
              <Row gap="12">
                <Button>Save changes</Button>
                <Button variant="secondary">Cancel</Button>
              </Row>
            </Column>

            <Column background="surface" border="neutral-alpha-weak" radius="l" padding="24" gap="24">
              <Heading as="h2" variant="heading-strong-m">
                Notifications
              </Heading>
              <Row fillWidth horizontal="between" vertical="center">
                <Column gap="4">
                  <Text variant="body-default-s">Product updates</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    Release notes and changelog
                  </Text>
                </Column>
                <Switch checked />
              </Row>
              <Line />
              <Row fillWidth horizontal="between" vertical="center">
                <Column gap="4">
                  <Text variant="body-default-s">Marketing emails</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    Tips, templates, and community highlights
                  </Text>
                </Column>
                <Switch />
              </Row>
              <Checkbox label="Weekly digest" isChecked />
            </Column>

            <Column background="surface" border="danger-alpha-medium" radius="l" padding="24" gap="16">
              <Heading as="h2" variant="heading-strong-m" onBackground="danger-medium">
                Danger zone
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Permanently delete your workspace and all associated data.
              </Text>
              <Button variant="danger" size="s">
                Delete workspace
              </Button>
            </Column>
          </Column>
        </SplitView>
      </Column>
    </Column>
  );
}
