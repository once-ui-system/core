"use client";

import { Button, Card, Group, SegmentedControl, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title, useMantineColorScheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { PageHeading } from "@/components/PageHeading";
import { user } from "@/lib/data";

export default function Page() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const form = useForm({
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      weeklyDigest: true,
      issueAssigned: true,
      productNews: false,
    },
    validate: {
      name: (value) => (value.trim().length < 2 ? "Please enter your name" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address"),
    },
  });

  const save = form.onSubmit(() => {
    notifications.show({
      title: "Settings saved",
      message: "Your changes are live. Nice one!",
      color: "teal",
      icon: <IconCheck size={18} aria-hidden />,
    });
    form.resetDirty();
  });

  return (
    <>
      <PageHeading title="Settings" description="Your profile, notifications and appearance." />
      <form onSubmit={save} noValidate>
        <Stack gap="lg" maw={760}>
          <Card>
            <Title order={2} fz={22} mb="md">
              Profile
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label="Full name" autoComplete="name" {...form.getInputProps("name")} />
              <TextInput label="Email" type="email" autoComplete="email" {...form.getInputProps("email")} />
              <Select
                label="Role"
                data={["Owner", "Admin", "Member"]}
                allowDeselect={false}
                {...form.getInputProps("role")}
              />
            </SimpleGrid>
          </Card>

          <Card>
            <Title order={2} fz={22} mb="md">
              Notifications
            </Title>
            <Stack gap="md">
              <Switch
                label="Weekly digest"
                description="A Monday summary of what moved across your projects."
                {...form.getInputProps("weeklyDigest", { type: "checkbox" })}
              />
              <Switch
                label="Issue assigned to me"
                description="Hear about it the moment a teammate hands you an issue."
                {...form.getInputProps("issueAssigned", { type: "checkbox" })}
              />
              <Switch
                label="Product news"
                description="Occasional updates about new Lumen features."
                {...form.getInputProps("productNews", { type: "checkbox" })}
              />
            </Stack>
          </Card>

          <Card>
            <Title order={2} fz={22} mb="xs">
              Appearance
            </Title>
            <Text c="dimmed" mb="md">
              Choose how Lumen looks for you.
            </Text>
            <SegmentedControl
              aria-label="Colour scheme"
              value={colorScheme}
              onChange={(value) => setColorScheme(value as "light" | "dark" | "auto")}
              data={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "auto" },
              ]}
            />
          </Card>

          <Group justify="flex-end">
            <Button type="button" variant="default" onClick={() => form.reset()}>
              Reset
            </Button>
            <Button type="submit">Save changes</Button>
          </Group>
        </Stack>
      </form>
    </>
  );
}
