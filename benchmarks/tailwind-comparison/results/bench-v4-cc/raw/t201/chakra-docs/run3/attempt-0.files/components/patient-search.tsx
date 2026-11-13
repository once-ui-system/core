"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { AlertChips } from "@/components/patient-alerts";
import { ownerOf, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    setQuery("");
    setOpen(false);
    setActive(0);
    router.push(`/patients/${id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const hit = results[active];
      if (hit) {
        e.preventDefault();
        go(hit.id);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <Box
      position="relative"
      w="full"
      maxW={{ md: "28rem" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <InputGroup flex="1" w="full" startElement={<LuSearch aria-hidden="true" />}>
        <Input
          type="search"
          size="lg"
          placeholder="Find a patient or owner"
          aria-label="Search patients or owners by name"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${results[active].id}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </InputGroup>

      {showPanel && (
        <Box
          position="absolute"
          top="calc(100% + 6px)"
          insetInline="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border"
          rounded="lg"
          shadow="lg"
          maxH="22rem"
          overflowY="auto"
          p="1"
        >
          <Stack id={listId} role="listbox" aria-label="Matching patients" gap="0">
            {results.map((p, i) => {
              const owner = ownerOf(p);
              return (
                <Box
                  key={p.id}
                  id={`${listId}-${p.id}`}
                  role="option"
                  aria-selected={i === active}
                  cursor="pointer"
                  rounded="md"
                  px="3"
                  py="2.5"
                  bg={i === active ? "bg.muted" : "transparent"}
                  _hover={{ bg: "bg.muted" }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(p.id)}
                >
                  <HStack justify="space-between" gap="3">
                    <Text fontWeight="semibold">{p.name}</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {p.species} · {p.breed}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted">
                    Owner: {owner.name} · {owner.phone}
                  </Text>
                  {p.alerts.length > 0 && (
                    <Box mt="1.5">
                      <AlertChips alerts={p.alerts} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
          {results.length === 0 && (
            <Text role="status" px="3" py="3" color="fg.muted" fontSize="sm">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
