"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Input, Row, Text } from "@once-ui-system/core";
import { ownerById, patients } from "@/lib/data";
import { AlertTags } from "@/components/Alerts";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => {
      const owner = ownerById[p.owner];
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  const showPanel = open && query.trim().length > 0;

  function reset() {
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      role="search"
      style={{ position: "relative", flex: "1 1 16rem", maxWidth: "30rem" }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") reset();
        if (e.key === "Enter" && results.length > 0) {
          e.preventDefault();
          const first = results[0];
          reset();
          router.push(`/patients/${first.id}`);
        }
      }}
    >
      <Input
        id="patient-search"
        label="Find a patient or owner"
        size="xs"
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        aria-controls="patient-search-results"
      />
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showPanel && (
        <Column
          id="patient-search-results"
          position="absolute"
          background="surface"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          zIndex={1}
          style={{ top: "calc(100% + 0.25rem)", left: 0, right: 0, maxHeight: "70vh", overflowY: "auto" }}
        >
          {results.length === 0 ? (
            <Text padding="12" onBackground="neutral-weak" textVariant="body-default-m">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            results.map((p) => {
              const owner = ownerById[p.owner];
              return (
                <Card key={p.id} href={`/patients/${p.id}`} onClick={reset} fillWidth padding="12" radius="m" gap="4">
                  <Row gap="8" vertical="center" wrap>
                    <Text textVariant="label-strong-m">{p.name}</Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {p.species}, {p.breed}
                    </Text>
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-medium">
                    Owner: {owner?.name} &middot; {owner?.phone}
                  </Text>
                  <AlertTags alerts={p.alerts} />
                </Card>
              );
            })
          )}
        </Column>
      )}
    </div>
  );
}
