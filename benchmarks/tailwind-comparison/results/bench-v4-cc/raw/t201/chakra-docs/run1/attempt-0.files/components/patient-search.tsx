"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { InputGroup } from "@/components/ui/input-group";
import { AlertPills } from "@/components/alerts";
import { getOwner, searchPatients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    router.push(`/patients/${id}`);
    setQuery("");
    setOpen(false);
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
    }
  };

  return (
    <Box
      position="relative"
      role="search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <InputGroup startElement={<LuSearch />} w="full">
        <Input
          size="lg"
          type="text"
          role="combobox"
          autoComplete="off"
          placeholder="Find a patient or owner"
          aria-label="Search patients or owners by name"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
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
          left="0"
          right="0"
          zIndex="dropdown"
          bg="bg.panel"
          borderWidth="1px"
          rounded="lg"
          shadow="lg"
          maxH="70dvh"
          overflowY="auto"
        >
          {results.length === 0 ? (
            <Text role="status" p="4" color="fg.muted">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            <Box as="ul" id={listId} role="listbox" aria-label="Matching patients" listStyleType="none" m="0" p="1">
              {results.map((p, i) => {
                const owner = getOwner(p.owner);
                return (
                  <Box
                    as="li"
                    key={p.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    cursor="pointer"
                    rounded="md"
                    px="3"
                    py="2.5"
                    bg={i === active ? "bg.muted" : undefined}
                    _hover={{ bg: "bg.muted" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(p.id)}
                  >
                    <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
                      <Box minW="0">
                        <Text fontWeight="semibold">
                          {p.name}{" "}
                          <Text as="span" fontWeight="normal" color="fg.muted">
                            {p.species} &middot; {p.breed}
                          </Text>
                        </Text>
                        <Text fontSize="sm" color="fg.muted">
                          Owner {owner.name} &middot; {owner.phone}
                        </Text>
                      </Box>
                      <AlertPills alerts={p.alerts} />
                    </Flex>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
