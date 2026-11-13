"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck, IconCircleDashed } from "@tabler/icons-react";
import { STORAGE_KEY, checklist, user } from "@/lib/data";

interface Saved {
  name?: string;
  workspace?: string;
}

export function WelcomeContent() {
  const [saved, setSaved] = useState<Saved>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const firstName = (saved.name || user.name).split(" ")[0];
  const workspace = saved.workspace || "your workspace";

  return (
    <Container size="sm" py={{ base: "xl", sm: 60 }}>
      <Stack gap="xl">
        <Stack gap="xs" align="flex-start">
          <ThemeIcon size={48} radius="xl" color="green" variant="light">
            <IconCheck size={28} aria-hidden="true" />
          </ThemeIcon>
          <Badge variant="light" color="green">
            Setup complete
          </Badge>
          <Title order={1} size="h2">
            You&apos;re all set, {firstName}!
          </Title>
          <Text c="dimmed">
            {workspace === "your workspace" ? "Your workspace is" : `${workspace} is`} ready. Here
            are a few things to do next to get the most out of Lumen.
          </Text>
        </Stack>

        <Card withBorder radius="md" padding="lg" component="section" aria-labelledby="next-steps">
          <Title order={2} size="h4" id="next-steps" mb="md">
            Your next steps
          </Title>
          <List
            spacing="md"
            center={false}
            icon={
              <ThemeIcon size={24} radius="xl" variant="light">
                <IconCircleDashed size={16} aria-hidden="true" />
              </ThemeIcon>
            }
          >
            {checklist.map((item) => (
              <List.Item key={item.title}>
                <Box>
                  <Text fw={600}>{item.title}</Text>
                  <Text size="sm" c="dimmed">
                    {item.text}
                  </Text>
                </Box>
              </List.Item>
            ))}
          </List>
        </Card>

        <Group>
          <Button component={Link} href="/">
            Back to onboarding
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
