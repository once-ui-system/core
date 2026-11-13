"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Box, Group, Paper, Text, TextInput, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { IconAlertTriangle, IconSearch } from "@tabler/icons-react";
import { ownerById, patients } from "@/lib/data";

export function PatientSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(q) || ownerById(p.owner).name.toLowerCase().includes(q));
  }, [query]);

  const showList = open && query.trim().length > 0;

  return (
    <Box
      pos="relative"
      w="100%"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <TextInput
        type="search"
        size="md"
        placeholder="Find a patient or owner"
        aria-label="Search patients and owners"
        aria-controls={showList ? listId : undefined}
        leftSection={<IconSearch size={18} aria-hidden="true" />}
        value={query}
        onChange={(e) => {
          setQuery(e.currentTarget.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
          if (e.key === "Enter" && results.length > 0) {
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
      />
      <VisuallyHidden aria-live="polite">
        {showList ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </VisuallyHidden>
      {showList && (
        <Paper
          id={listId}
          withBorder
          shadow="lg"
          radius="md"
          pos="absolute"
          top="calc(100% + 6px)"
          left={0}
          right={0}
          p={4}
          style={{ zIndex: 400 }}
        >
          {results.length === 0 ? (
            <Text c="dimmed" fz="sm" p="sm">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box component="ul" m={0} p={0} style={{ listStyle: "none" }}>
              {results.map((p) => (
                <li key={p.id}>
                  <UnstyledButton
                    component={Link}
                    href={`/patients/${p.id}`}
                    onClick={() => setOpen(false)}
                    w="100%"
                    p="sm"
                    style={{ borderRadius: "var(--mantine-radius-sm)", display: "block", minHeight: 48 }}
                  >
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Box style={{ minWidth: 0 }}>
                        <Text fw={700} fz="md" c="dark.9">
                          {p.name}{" "}
                          <Text span c="dimmed" fw={400} fz="sm">
                            {p.species} · {p.breed}
                          </Text>
                        </Text>
                        <Text fz="sm" c="gray.7">
                          Owner: {ownerById(p.owner).name}
                        </Text>
                      </Box>
                      {p.alerts.length > 0 && (
                        <Badge color="red.8" variant="filled" tt="none" leftSection={<IconAlertTriangle size={12} aria-hidden="true" />}>
                          {p.alerts.length === 1 ? "Alert" : `${p.alerts.length} alerts`}
                        </Badge>
                      )}
                    </Group>
                  </UnstyledButton>
                </li>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
