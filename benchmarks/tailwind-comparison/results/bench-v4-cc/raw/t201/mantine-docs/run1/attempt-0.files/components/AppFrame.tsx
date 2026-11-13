"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  AppShell,
  Avatar,
  Box,
  Container,
  Group,
  Popover,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconPaw, IconSearch } from "@tabler/icons-react";
import { CLINIC_NAME, currentUser, getOwner, patients } from "@/lib/data";
import { AlertFlags } from "./AlertFlags";

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const results =
    q.length === 0
      ? []
      : patients
          .filter((p) => {
            const owner = getOwner(p.owner);
            return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
          })
          .slice(0, 6);

  const done = () => {
    setQuery("");
    setOpen(false);
  };

  return (
    <Popover
      opened={open && q.length > 0}
      onChange={setOpen}
      width="target"
      position="bottom-start"
      shadow="md"
      withinPortal={false}
      trapFocus={false}
    >
      <Popover.Target>
        <TextInput
          aria-label="Search patients or owners"
          placeholder="Search patient or owner"
          leftSection={<IconSearch size={16} aria-hidden />}
          value={query}
          size="md"
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length > 0) {
              e.preventDefault();
              router.push(`/patients/${results[0].id}`);
              done();
            }
          }}
        />
      </Popover.Target>
      <Popover.Dropdown p={6}>
        {results.length === 0 ? (
          <Text size="sm" c="dimmed" p="xs">
            No patient or owner matches &ldquo;{query.trim()}&rdquo;.
          </Text>
        ) : (
          <Stack gap={2} role="list" aria-label="Search results">
            {results.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <UnstyledButton
                  key={p.id}
                  component={Link}
                  href={`/patients/${p.id}`}
                  role="listitem"
                  onClick={done}
                  p="xs"
                  style={{ borderRadius: 8 }}
                  className="pp-result"
                >
                  <Group justify="space-between" gap="xs" wrap="nowrap" align="flex-start">
                    <Box>
                      <Text fw={700} size="sm">
                        {p.name}{" "}
                        <Text span c="dimmed" fw={400}>
                          {p.species}, {p.breed}
                        </Text>
                      </Text>
                      <Text size="xs" c="dimmed">
                        Owner: {owner?.name}
                      </Text>
                    </Box>
                  </Group>
                  {p.alerts.length > 0 && (
                    <Box mt={4}>
                      <AlertFlags alerts={p.alerts} />
                    </Box>
                  )}
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 68 }} padding={{ base: "sm", sm: "md" }}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="md" wrap="nowrap">
          <Anchor
            component={Link}
            href="/"
            underline="never"
            c="inherit"
            aria-label="Pawpoint, today's schedule"
          >
            <Group gap="xs" wrap="nowrap">
              <Box
                bg="teal.8"
                c="white"
                w={38}
                h={38}
                style={{ borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0 }}
              >
                <IconPaw size={22} aria-hidden />
              </Box>
              <Box visibleFrom="sm">
                <Text fw={800} size="lg" lh={1.1}>
                  Pawpoint
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {CLINIC_NAME}
                </Text>
              </Box>
            </Group>
          </Anchor>
          <Box style={{ flex: 1, maxWidth: 520 }}>
            <PatientSearch />
          </Box>
          <Group gap="xs" ml="auto" wrap="nowrap">
            <Box visibleFrom="md" ta="right">
              <Text size="sm" fw={600} lh={1.2}>
                {currentUser.name}
              </Text>
              <Text size="xs" c="dimmed" lh={1.2}>
                {currentUser.role}
              </Text>
            </Box>
            <Avatar name={currentUser.name} color="initials" aria-label={`Signed in as ${currentUser.name}`} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main
        style={{ background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))" }}
      >
        <Container size="xl" p={0}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
