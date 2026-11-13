"use client";

import { Button, Card, Group, SegmentedControl, Select, Stack, Switch, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMantineColorScheme } from "@mantine/core";
import { PageHeading } from "@/components/PageHeading";
import { user } from "@/lib/data";

interface SettingsValues {
  name: string;
  email: string;
  digest: string;
  issueAlerts: boolean;
  weeklyReport: boolean;
}

const initialValues: SettingsValues = {
  name: user.name,
  email: user.email,
  digest: "daily",
  issueAlerts: true,
  weeklyReport: false,
};

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm<SettingsValues>({
    mode: "uncontrolled",
    initialValues,
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter your full name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your profile and notification preferences are up to date.",
      color: "teal",
    });
  });

  return (
    <>
      <PageHeading title="Settings" description="Your profile, notifications and appearance." />
      <Stack gap="md" maw={640}>
        <form onSubmit={save} noValidate>
          <Stack gap="md">
            <Card component="section" aria-labelledby="profile-heading">
              <Title order={2} id="profile-heading" mb="sm">
                Profile
              </Title>
              <Stack gap="sm">
                <TextInput
                  label="Full name"
                  autoComplete="name"
                  key={form.key("name")}
                  {...form.getInputProps("name")}
                />
                <TextInput
                  label="Email"
                  type="email"
                  autoComplete="email"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />
                <Text size="sm" c="dimmed">
                  Role: {user.role}
                </Text>
              </Stack>
            </Card>

            <Card component="section" aria-labelledby="notify-heading">
              <Title order={2} id="notify-heading" mb="sm">
                Notifications
              </Title>
              <Stack gap="sm">
                <Select
                  label="Email digest"
                  allowDeselect={false}
                  data={[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "off", label: "Off" },
                  ]}
                  key={form.key("digest")}
                  {...form.getInputProps("digest")}
                />
                <Switch
                  label="Alert me when an issue is assigned to me"
                  key={form.key("issueAlerts")}
                  {...form.getInputProps("issueAlerts", { type: "checkbox" })}
                />
                <Switch
                  label="Send the weekly analytics report"
                  key={form.key("weeklyReport")}
                  {...form.getInputProps("weeklyReport", { type: "checkbox" })}
                />
              </Stack>
            </Card>

            <Group>
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="default" onClick={() => form.reset()}>
                Reset
              </Button>
            </Group>
          </Stack>
        </form>

        <Card component="section" aria-labelledby="appearance-heading">
          <Title order={2} id="appearance-heading" mb="sm">
            Appearance
          </Title>
          <SegmentedControl
            aria-label="Colour scheme"
            value={colorScheme}
            onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
            data={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "auto", label: "System" },
            ]}
          />
        </Card>
      </Stack>
    </>
  );
}
