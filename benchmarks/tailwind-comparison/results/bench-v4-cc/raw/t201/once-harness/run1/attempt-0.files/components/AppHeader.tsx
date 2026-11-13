"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar, Column, Icon, Input, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { USER, findOwner, initials, patients } from "@/lib/data";
import { AlertTags } from "./Alerts";

export function AppHeader() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: findOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false));
  }, [q]);

  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      horizontal="center"
      paddingX="16"
      paddingY="12"
    >
      <Row fillWidth maxWidth="80rem" gap="16" vertical="center" wrap>
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }} aria-label="Pawpoint, today's schedule">
          <Row gap="12" vertical="center">
            <Row fit background="brand-alpha-weak" radius="m" padding="8">
              <Icon name="paw" size="l" onBackground="brand-strong" decorative />
            </Row>
            <Column gap="0">
              <Text textVariant="heading-strong-m">Pawpoint</Text>
              <Text textVariant="body-default-xs" onBackground="neutral-weak" s={{ hide: true }}>
                Hillside Veterinary Clinic
              </Text>
            </Column>
          </Row>
        </Link>

        <Column
          flex="1"
          minWidth="260px"
          maxWidth="32rem"
          position="relative"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Escape") setQuery("");
          }}
        >
          <Input
            id="patient-search"
            label="Search patients or owners"
            size="s"
            type="search"
            autoComplete="off"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            prefix={<Icon name="search" size="s" onBackground="neutral-weak" decorative />}
          />
          <VisuallyHidden>
            <span role="status" aria-live="polite">
              {q ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : ""}
            </span>
          </VisuallyHidden>
          {q ? (
            <Column
              position="absolute"
              top="100%"
              left="0"
              fillWidth
              marginTop="4"
              zIndex={10}
              background="surface"
              border
              radius="m"
              shadow="l"
              padding="8"
              gap="4"
            >
              {matches.length === 0 ? (
                <Text padding="12" onBackground="neutral-weak">
                  No patient or owner matches “{query.trim()}”.
                </Text>
              ) : (
                matches.map(({ p, owner }) => (
                  <Link
                    key={p.id}
                    href={`/patients/${p.id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                    onClick={() => setQuery("")}
                  >
                    <Column padding="12" radius="s" gap="4" background="neutral-alpha-weak">
                      <Row gap="8" vertical="center" wrap>
                        <Text textVariant="label-strong-m">{p.name}</Text>
                        <Text textVariant="body-default-s" onBackground="neutral-weak">
                          {p.species}, {p.breed} · owner {owner?.name}
                        </Text>
                      </Row>
                      <AlertTags alerts={p.alerts} />
                    </Column>
                  </Link>
                ))
              )}
            </Column>
          ) : null}
        </Column>

        <Row gap="12" vertical="center" marginLeft="auto">
          <Column horizontal="end" gap="0" s={{ hide: true }}>
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
          <Avatar value={initials(USER.name)} size="m" />
        </Row>
      </Row>
    </Row>
  );
}
