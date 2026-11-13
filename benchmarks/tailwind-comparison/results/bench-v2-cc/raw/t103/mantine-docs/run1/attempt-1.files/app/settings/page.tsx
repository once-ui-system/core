"use client";

import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Input,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { user } from "@/lib/data";

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      notifyAssigned: true,
      notifyWeekly: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Enter at least 2 characters" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  return (
    <Container size="sm" p={0} ml={0}>
      <Stack gap="lg">
        <Box>
          <Title order={1} size="h2">
            Settings
          </Title>
          <Text c="dimmed" mt={4}>
            Your profile, notifications and appearance.
          </Text>
        </Box>

        <form
          onSubmit={form.onSubmit(() => {
            notifications.show({
              title: "Settings saved",
              message: "Your changes have been applied.",
            });
          })}
        >
          <Stack gap="md">
            <Card>
              <Title order={2} size="h4" mb="md">
                Profile
              </Title>
              <Stack gap="sm">
                <TextInput label="Name" required {...form.getInputProps("name")} />
                <TextInput label="Email" type="email" required {...form.getInputProps("email")} />
                <TextInput
                  label="Role"
                  value={user.role}
                  readOnly
                  description="Only another owner can change your role."
                />
              </Stack>
            </Card>

            <Card>
              <Title order={2} size="h4" mb="md">
                Notifications
              </Title>
              <Stack gap="md">
                <Switch
                  label="Issues assigned to me"
                  description="Send an email when an issue is assigned to you."
                  {...form.getInputProps("notifyAssigned", { type: "checkbox" })}
                />
                <Switch
                  label="Weekly summary"
                  description="A Monday digest of activity in your active projects."
                  {...form.getInputProps("notifyWeekly", { type: "checkbox" })}
                />
              </Stack>
            </Card>

            <Card>
              <Title order={2} size="h4" mb="md">
                Appearance
              </Title>
              <Input.Wrapper label="Color scheme" description="Dark is the default for Lumen.">
                <Box mt="xs">
                  <SegmentedControl
                    value={colorScheme}
                    onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
                    data={[
                      { label: "Dark", value: "dark" },
                      { label: "Light", value: "light" },
                      { label: "System", value: "auto" },
                    ]}
                    aria-label="Color scheme"
                  />
                </Box>
              </Input.Wrapper>
            </Card>

            <Group justify="flex-end">
              <Button type="button" variant="default" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">Save changes</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
