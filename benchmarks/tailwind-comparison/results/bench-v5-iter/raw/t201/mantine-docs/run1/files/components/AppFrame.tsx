"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell, Avatar, Badge, Button, Group, Text, UnstyledButton, ThemeIcon, Box } from "@mantine/core";
import { Spotlight, spotlight, type SpotlightActionData } from "@mantine/spotlight";
import { IconPaw, IconSearch, IconAlertTriangleFilled } from "@tabler/icons-react";
import { getOwner, patients, user, clinicName } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo<SpotlightActionData[]>(
    () =>
      patients.map((p) => {
        const owner = getOwner(p.owner);
        return {
          id: p.id,
          label: p.name,
          description: `${p.species}, ${p.breed} · Owner ${owner.name} · ${owner.phone}`,
          keywords: [owner.name, p.species, p.breed],
          leftSection: <IconPaw size={22} aria-hidden />,
          rightSection:
            p.alerts.length > 0 ? (
              <Badge
                color="red.7"
                variant="filled"
                leftSection={<IconAlertTriangleFilled size={12} aria-hidden />}
                styles={{ label: { textTransform: "none" } }}
              >
                {p.alerts.length === 1 ? "Alert" : `${p.alerts.length} alerts`}
              </Badge>
            ) : undefined,
          onClick: () => router.push(`/patients/${p.id}`),
        };
      }),
    [router],
  );

  return (
    <AppShell header={{ height: 64 }} padding={{ base: "sm", sm: "md", lg: "lg" }} bg="gray.0">
      <AppShell.Header>
        <Group h="100%" px={{ base: "sm", sm: "md", lg: "lg" }} justify="space-between" wrap="nowrap" gap="sm">
          <UnstyledButton component={Link} href="/" aria-label="Pawpoint, today's schedule">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={38} radius="md" color="teal.7">
                <IconPaw size={24} aria-hidden />
              </ThemeIcon>
              <Box>
                <Text fw={800} fz="lg" lh={1.1}>
                  Pawpoint
                </Text>
                <Text fz="xs" c="gray.7" lh={1.1} visibleFrom="sm">
                  {clinicName}
                </Text>
              </Box>
            </Group>
          </UnstyledButton>

          <Button
            variant="default"
            size="md"
            h={44}
            onClick={spotlight.open}
            leftSection={<IconSearch size={18} aria-hidden />}
            aria-label="Search patients or owners"
            justify="space-between"
            style={{ flex: "0 1 420px", minWidth: 0 }}
            rightSection={
              <Text span fz="xs" c="gray.7" visibleFrom="md">
                Ctrl K
              </Text>
            }
          >
            <Text span c="gray.7" fw={400} truncate>
              Find a patient or owner
            </Text>
          </Button>

          <Group gap="xs" wrap="nowrap" visibleFrom="sm">
            <Avatar color="teal" radius="xl">
              RL
            </Avatar>
            <Box>
              <Text fz="sm" fw={600} lh={1.2}>
                {user.name}
              </Text>
              <Text fz="xs" c="gray.7" lh={1.2}>
                {user.role}
              </Text>
            </Box>
          </Group>
          <Avatar color="teal" radius="xl" hiddenFrom="sm" aria-label={`${user.name}, ${user.role}`}>
            RL
          </Avatar>
        </Group>
      </AppShell.Header>

      <Spotlight
        actions={actions}
        shortcut={["mod + K", "/"]}
        highlightQuery
        limit={8}
        nothingFound="No patient or owner with that name"
        searchProps={{
          leftSection: <IconSearch size={20} aria-hidden />,
          placeholder: "Search by pet or owner name",
          "aria-label": "Search by pet or owner name",
        }}
      />

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
