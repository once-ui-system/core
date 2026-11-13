"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Combobox, Group, Text, TextInput, useCombobox } from "@mantine/core";
import { IconAlertTriangleFilled, IconSearch } from "@tabler/icons-react";
import { getOwner, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: getOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false))
      .slice(0, 8);
  }, [query]);

  return (
    <Combobox
      store={combobox}
      withinPortal
      onOptionSubmit={(id) => {
        setQuery("");
        combobox.closeDropdown();
        router.push(`/patients/${id}`);
      }}
    >
      <Combobox.Target>
        <TextInput
          aria-label="Search patient or owner by name"
          placeholder="Search patient or owner"
          size="md"
          leftSection={<IconSearch size={18} aria-hidden />}
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            combobox.openDropdown();
            combobox.selectFirstOption();
          }}
          onFocus={() => query && combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {query.trim() === "" ? (
            <Combobox.Empty>Type a pet or owner name</Combobox.Empty>
          ) : results.length === 0 ? (
            <Combobox.Empty>No patient or owner found</Combobox.Empty>
          ) : (
            results.map(({ p, owner }) => (
              <Combobox.Option key={p.id} value={p.id} py="sm">
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <div>
                    <Text fw={650} size="sm">
                      {p.name}{" "}
                      <Text span c="dimmed" fw={400}>
                        {p.species}, {p.breed}
                      </Text>
                    </Text>
                    <Text size="xs" c="dimmed">
                      Owner: {owner?.name}
                    </Text>
                  </div>
                  {p.alerts.length > 0 && (
                    <IconAlertTriangleFilled
                      size={18}
                      color="var(--mantine-color-red-7)"
                      aria-label="Has medical alerts"
                      role="img"
                    />
                  )}
                </Group>
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
