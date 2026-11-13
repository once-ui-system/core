"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Anchor, AppShell, Avatar, Box, Group, Text, UnstyledButton } from "@mantine/core";
import { Spotlight, type SpotlightActionData, spotlight } from "@mantine/spotlight";
import { IconPaw, IconSearch, IconAlertTriangleFilled } from "@tabler/icons-react";
import { CLINIC, CLINIC_LONG, USER, getOwner, patients } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const actions = useMemo<SpotlightActionData[]>(
    () =>
      patients.map((p) => {
        const owner = getOwner(p.owner);
        return {
          id: p.id,
          label: p.alerts.length ? `${p.name} (alert: ${p.alerts.join("; ")})` : p.name,
          description: `${p.species}, ${p.breed} · Owner ${owner?.name ?? ""} · ${owner?.phone ?? ""}`,
          keywords: [owner?.name ?? "", p.species, p.breed],
          leftSection: p.alerts.length ? (
            <IconAlertTriangleFilled size={22} color="var(--mantine-color-red-8)" aria-hidden />
          ) : (
            <IconPaw size={22} aria-hidden />
          ),
          onClick: () => router.push(`/patients/${p.id}`),
        };
      }),
    [router],
  );

  return (
    <AppShell header={{ height: 64 }} padding={0}>
      <Anchor
        href="#main"
        style={{ position: "absolute", left: -9999 }}
        onFocus={(e) => (e.currentTarget.style.left = "8px")}
        onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
        c="white"
        bg="teal.9"
        p="xs"
        fz="sm"
        // visible only on keyboard focus
        styles={{ root: { zIndex: 1000, top: 8 } }}
      >
        Skip to content
      </Anchor>
      <AppShell.Header bg="teal.9" style={{ border: 0 }}>
        <Group h="100%" px={{ base: "sm", sm: "lg" }} justify="space-between" wrap="nowrap" gap="sm">
          <Anchor component={Link} href="/" c="white" underline="never">
            <Group gap={10} wrap="nowrap">
              <Box
                w={36}
                h={36}
                bg="white"
                style={{ borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}
              >
                <IconPaw size={22} color="var(--mantine-color-teal-9)" aria-hidden />
              </Box>
              <Box>
                <Text fw={800} fz="lg" lh={1.1} c="white">
                  {CLINIC}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2} visibleFrom="sm">
                  {CLINIC_LONG}
                </Text>
              </Box>
            </Group>
          </Anchor>

          <Group gap="sm" wrap="nowrap" style={{ flex: 1, justifyContent: "flex-end" }}>
            <UnstyledButton
              onClick={spotlight.open}
              aria-keyshortcuts="Control+K"
              style={{
                background: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 10,
                color: "white",
                height: 42,
                padding: "0 14px",
                flex: "1 1 auto",
                maxWidth: 380,
                minWidth: 0,
              }}
            >
              <Group gap={10} wrap="nowrap">
                <IconSearch size={18} aria-hidden />
                <Text fz="sm" c="white" truncate>
                  Search patient or owner
                </Text>
              </Group>
            </UnstyledButton>
            <Group gap="xs" wrap="nowrap" visibleFrom="md">
              <Avatar color="teal.1" variant="filled" radius="xl" size={36}>
                RL
              </Avatar>
              <Box>
                <Text fz="sm" fw={600} c="white" lh={1.2}>
                  {USER.name}
                </Text>
                <Text fz="xs" c="teal.1" lh={1.2}>
                  {USER.role}
                </Text>
              </Box>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <Spotlight
        actions={actions}
        shortcut={["mod + K", "/"]}
        nothingFound="No patient or owner found"
        highlightQuery
        limit={8}
        searchProps={{
          leftSection: <IconSearch size={20} aria-hidden />,
          placeholder: "Search by pet or owner name",
          "aria-label": "Search patients or owners",
        }}
      />

      <AppShell.Main id="main" bg="gray.0">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
