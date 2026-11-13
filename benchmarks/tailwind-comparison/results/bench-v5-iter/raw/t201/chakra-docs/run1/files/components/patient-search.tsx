"use client";

import { useId, useMemo, useRef, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Box, Flex, HStack, Icon, Input, Text } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { AlertChips } from "@/components/patient-alerts";
import { ownerById, patients } from "@/lib/data";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return patients.filter((p) => {
      const owner = ownerById(p.owner);
      return p.name.toLowerCase().includes(q) || owner.name.toLowerCase().includes(q);
    });
  }, [q]);

  const showPanel = open && q.length > 0;

  function close() {
    setOpen(false);
  }

  return (
    <Box
      ref={wrapRef}
      position="relative"
      w="full"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            close();
            setQuery("");
            router.push(`/patients/${results[0].id}`);
          }
        }}
      >
        <Box position="relative">
          <Icon
            position="absolute"
            left="3"
            top="50%"
            transform="translateY(-50%)"
            color="fg.muted"
            boxSize="4"
            aria-hidden
            pointerEvents="none"
            zIndex="1"
          >
            <FiSearch />
          </Icon>
          <Input
            type="search"
            aria-label="Search patient or owner by name"
            placeholder="Search patient or owner"
            value={query}
            ps="9"
            size="md"
            bg="bg.panel"
            autoComplete="off"
            aria-controls={showPanel ? listId : undefined}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
            }}
          />
        </Box>
      </form>

      {showPanel && (
        <Box
          id={listId}
          position="absolute"
          top="calc(100% + 6px)"
          left="0"
          right="0"
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
          <Text srOnly aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
          {results.length === 0 ? (
            <Text p="3" color="fg.muted" fontSize="sm">
              No patient or owner matches “{query.trim()}”.
            </Text>
          ) : (
            <Box as="ul" listStyleType="none" m="0" p="0">
              {results.map((p) => {
                const owner = ownerById(p.owner);
                return (
                  <li key={p.id}>
                    <Flex
                      asChild
                      direction="column"
                      gap="1"
                      p="2.5"
                      rounded="md"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{ outline: "2px solid", outlineColor: "teal.focusRing" }}
                    >
                      <NextLink
                        href={`/patients/${p.id}`}
                        onClick={() => {
                          close();
                          setQuery("");
                        }}
                      >
                        <HStack justify="space-between" gap="3" wrap="wrap">
                          <Text fontWeight="semibold">{p.name}</Text>
                          <Text fontSize="sm" color="fg.muted">
                            {p.species} · {p.breed}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                          Owner: {owner.name} · {owner.phone}
                        </Text>
                        <AlertChips alerts={p.alerts} />
                      </NextLink>
                    </Flex>
                  </li>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
