"use client";

import Link from "next/link";
import { Avatar, Box, Container, Flex, Group, Text, UnstyledButton } from "@mantine/core";
import { IconPaw } from "@tabler/icons-react";
import { CLINIC, CLINIC_LONG, user } from "@/lib/data";
import { PatientSearch } from "./PatientSearch";

export function Frame({ children }: { children: React.ReactNode }) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <Box mih="100vh" bg="gray.0">
      <Box component="header" bg="teal.9" c="white" pos="sticky" top={0} style={{ zIndex: 300 }}>
        <Container size="xl" py="sm">
          <Flex direction={{ base: "column", sm: "row" }} gap="sm" align={{ base: "stretch", sm: "center" }}>
            <Group justify="space-between" wrap="nowrap" style={{ flexShrink: 0 }}>
              <UnstyledButton component={Link} href="/" aria-label={`${CLINIC}, today's schedule`} c="white">
                <Group gap="xs" wrap="nowrap">
                  <Box
                    w={40}
                    h={40}
                    style={{
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "var(--mantine-radius-md)",
                      background: "var(--mantine-color-teal-6)",
                    }}
                  >
                    <IconPaw size={24} aria-hidden="true" />
                  </Box>
                  <Box>
                    <Text fw={800} fz="lg" lh={1.1} c="white">
                      {CLINIC}
                    </Text>
                    <Text fz="xs" c="teal.1" lh={1.2}>
                      {CLINIC_LONG}
                    </Text>
                  </Box>
                </Group>
              </UnstyledButton>
              <Group gap="xs" wrap="nowrap" hiddenFrom="sm">
                <Avatar color="teal.2" variant="filled" radius="xl" size={36} aria-hidden="true" c="teal.9">
                  {initials}
                </Avatar>
              </Group>
            </Group>
            <Box style={{ flex: 1, maxWidth: 560 }} w="100%" mx={{ sm: "auto" }}>
              <PatientSearch />
            </Box>
            <Group gap="sm" wrap="nowrap" visibleFrom="sm" style={{ flexShrink: 0 }}>
              <Box ta="right">
                <Text fw={700} fz="sm" c="white" lh={1.2}>
                  {user.name}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2}>
                  {user.role}
                </Text>
              </Box>
              <Avatar color="teal.2" variant="filled" radius="xl" size={40} aria-hidden="true" c="teal.9">
                {initials}
              </Avatar>
            </Group>
          </Flex>
        </Container>
      </Box>
      <Box component="main" id="main">
        <Container size="xl" py="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
}
