"use client";

import Link from "next/link";
import { Avatar, Box, Container, Group, Text, UnstyledButton } from "@mantine/core";
import { IconPaw } from "@tabler/icons-react";
import { CLINIC, PRODUCT, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      mih="100dvh"
      style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
    >
      <Box
        component="header"
        style={{
          background: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-default-border)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Container size={1400} px={{ base: "md", sm: "lg" }} py="sm">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <UnstyledButton component={Link} href="/" aria-label={`${PRODUCT}, today's schedule`}>
              <Group gap="sm" wrap="nowrap">
                <Box
                  w={40}
                  h={40}
                  style={{
                    background: "var(--mantine-color-teal-7)",
                    color: "white",
                    borderRadius: "var(--mantine-radius-md)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <IconPaw size={24} aria-hidden />
                </Box>
                <div>
                  <Text fw={750} size="lg" lh={1.1}>
                    {PRODUCT}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    {CLINIC}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>

            <Box visibleFrom="sm" w={340}>
              <PatientSearch />
            </Box>

            <Group gap="sm" wrap="nowrap">
              <Box visibleFrom="xs" ta="right">
                <Text size="sm" fw={650} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="teal" radius="xl" aria-label={`${user.name}, ${user.role}`}>
                RL
              </Avatar>
            </Group>
          </Group>
          <Box hiddenFrom="sm" mt="sm">
            <PatientSearch />
          </Box>
        </Container>
      </Box>
      <Container component="main" size={1400} px={{ base: "md", sm: "lg" }} py={{ base: "md", sm: "lg" }}>
        {children}
      </Container>
    </Box>
  );
}
