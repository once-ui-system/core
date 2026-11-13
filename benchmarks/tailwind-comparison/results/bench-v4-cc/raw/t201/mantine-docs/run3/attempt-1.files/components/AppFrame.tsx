"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, Autocomplete, Avatar, Box, Container, Group, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconPaw, IconSearch } from "@tabler/icons-react";
import { owners, ownerById, patients, user } from "@/lib/data";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => {
      const o = ownerById(p.owner);
      map.set(`${p.name} · ${p.species}, ${p.breed} · ${o.name}`, p.id);
    });
    return map;
  }, []);
  const data = useMemo(() => Array.from(options.keys()), [options]);

  const open = (label: string) => {
    const id = options.get(label);
    if (id) {
      setQuery("");
      router.push(`/patients/${id}`);
    }
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
      }}
    >
      <a
        href="#main"
        style={{ position: "absolute", left: -9999, top: 8, zIndex: 1000, background: "white", padding: 8 }}
        onFocus={(e) => (e.currentTarget.style.left = "8px")}
        onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
      >
        Skip to content
      </a>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))",
          borderBottom: "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
        }}
      >
        <Container size="xl" py="xs">
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Anchor component={Link} href="/" underline="never" c="inherit" aria-label="Pawpoint, today's schedule">
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={40} radius="md" color="teal" variant="filled">
                  <IconPaw size={26} aria-hidden="true" />
                </ThemeIcon>
                <Box>
                  <Text fw={800} size="lg" lh={1.1}>
                    Pawpoint
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    Hillside Veterinary Clinic
                  </Text>
                </Box>
              </Group>
            </Anchor>

            <Box style={{ flex: "1 1 280px", maxWidth: 520, order: 3 }} role="search">
              <Autocomplete
                size="md"
                aria-label="Find a patient or owner by name"
                placeholder="Find a patient or owner…"
                leftSection={<IconSearch size={18} aria-hidden="true" />}
                data={data}
                value={query}
                onChange={setQuery}
                onOptionSubmit={open}
                limit={6}
                maxDropdownHeight={320}
                renderOption={({ option }) => {
                  const p = patients.find((x) => x.id === options.get(option.value));
                  return (
                    <Group gap="xs" wrap="nowrap" justify="space-between" w="100%">
                      <Text size="sm">{option.value}</Text>
                      {p && p.alerts.length > 0 ? (
                        <IconAlertTriangle size={18} color="var(--mantine-color-red-6)" aria-label="Has medical alerts" />
                      ) : null}
                    </Group>
                  );
                }}
              />
            </Box>

            <Group gap="xs" wrap="nowrap" style={{ order: 2 }}>
              <Avatar color="teal" radius="xl" aria-hidden="true">
                RL
              </Avatar>
              <Box visibleFrom="xs">
                <Text size="sm" fw={600} lh={1.2}>
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed" lh={1.2}>
                  {user.role} · {owners.length} owners on file
                </Text>
              </Box>
            </Group>
          </Group>
        </Container>
      </Box>
      <Container size="xl" py="lg" component="main" id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </Container>
    </Box>
  );
}
