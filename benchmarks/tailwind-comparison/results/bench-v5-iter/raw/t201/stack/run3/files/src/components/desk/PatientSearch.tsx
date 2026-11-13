"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Column, Icon, Input, Row, Text } from "@once-ui-system/core";
import { getOwner, patients } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false);
    });
  }, [query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const show = open && query.trim().length > 0;

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: "100%" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
        if (e.key === "Enter" && results.length > 0) {
          e.preventDefault();
          setOpen(false);
          router.push(`/patients/${results[0].id}`);
        }
      }}
    >
      <Input
        id="patient-search"
        type="search"
        label="Search patient or owner"
        size="s"
        value={query}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      />
      {show && (
        <Column
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          fillWidth
          style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 20, maxHeight: "70vh", overflowY: "auto" }}
          role="region"
          aria-label="Search results"
          aria-live="polite"
        >
          {results.length === 0 ? (
            <Text variant="body-default-s" onBackground="neutral-weak" padding="12">
              No patient or owner matches &ldquo;{query.trim()}&rdquo;.
            </Text>
          ) : (
            results.map((p) => {
              const owner = getOwner(p.owner);
              return (
                <Card
                  key={p.id}
                  href={`/patients/${p.id}`}
                  fillWidth
                  padding="12"
                  radius="m"
                  gap="8"
                  onClick={() => setOpen(false)}
                  aria-label={`Open record: ${p.name}, owner ${owner?.name ?? ""}`}
                >
                  <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
                    <Column gap="2">
                      <Text variant="label-strong-m">{p.name}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {p.species}, {p.breed} &middot; {owner?.name}
                      </Text>
                    </Column>
                    <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
                  </Row>
                  <AlertTags alerts={p.alerts} size="s" />
                </Card>
              );
            })
          )}
        </Column>
      )}
    </div>
  );
}
