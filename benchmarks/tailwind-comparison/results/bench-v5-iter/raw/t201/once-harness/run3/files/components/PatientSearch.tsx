"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Icon, Input, Row, Text } from "@once-ui-system/core";
import { OWNERS, PATIENTS, getOwner } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function PatientSearch() {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PATIENTS.filter((p) => {
      const owner = OWNERS.find((o) => o.id === p.owner);
      return (
        p.name.toLowerCase().includes(q) ||
        (owner ? owner.name.toLowerCase().includes(q) : false)
      );
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  return (
    <Column
      ref={box}
      position="relative"
      fillWidth
      maxWidth="m"
      onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
        if (!box.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <Input
        id="patient-search"
        type="search"
        label="Search patient or owner"
        size="s"
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
        value={query}
        autoComplete="off"
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter" && results.length > 0) {
            e.preventDefault();
            setOpen(false);
            router.push(`/patients/${results[0].id}`);
          }
        }}
        aria-controls={showPanel ? "patient-search-results" : undefined}
      />
      {showPanel && (
        <Column
          id="patient-search-results"
          position="absolute"
          top="48"
          left="0"
          fillWidth
          zIndex={10}
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          maxHeight="24rem"
          overflowY="auto"
          aria-label="Search results"
        >
          <Text as="p" textVariant="label-default-s" onBackground="neutral-weak" marginX="8" marginY="4" aria-live="polite">
            {results.length === 0
              ? "No patient or owner matches that name"
              : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
          </Text>
          {results.map((p) => {
            const owner = getOwner(p.owner);
            return (
              <Card
                key={p.id}
                href={`/patients/${p.id}`}
                fillWidth
                padding="12"
                radius="m"
                gap="4"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Row gap="12" vertical="center" horizontal="between" wrap>
                  <Row gap="8" vertical="center">
                    <Icon name="paw" size="s" onBackground="brand-medium" />
                    <Text textVariant="label-strong-m">{p.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {p.species}, {p.breed}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    Owner: {owner?.name}
                  </Text>
                </Row>
                <AlertTags alerts={p.alerts} size="s" />
              </Card>
            );
          })}
        </Column>
      )}
    </Column>
  );
}
