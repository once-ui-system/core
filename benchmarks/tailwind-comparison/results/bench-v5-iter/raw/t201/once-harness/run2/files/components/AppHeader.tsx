"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, Column, Heading, Icon, Input, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { AlertTags } from "@/components/AlertTags";
import { CLINIC, PRODUCT, TODAY, USER, getOwner, patients } from "@/lib/data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export function AppHeader() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return patients
      .map((p) => ({ p, owner: getOwner(p.owner) }))
      .filter(({ p, owner }) => p.name.toLowerCase().includes(q) || (owner?.name.toLowerCase().includes(q) ?? false));
  }, [q]);

  const dateLabel = new Date(`${TODAY}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Row
      as="header"
      fillWidth
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      gap="16"
      vertical="center"
      position="sticky"
      top="0"
      zIndex={5}
      s={{ gap: "8", paddingX: "12" }}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Link href="/" aria-label={`${PRODUCT} home`} style={{ textDecoration: "none", color: "inherit" }}>
        <Row gap="8" vertical="center" fit>
          <Row center radius="m" background="brand-medium" width="40" height="40" onBackground="brand-strong">
            <Icon name="paw" size="m" />
          </Row>
          <Column gap="0" s={{ hide: true }}>
            <Heading as="span" textVariant="heading-strong-m">
              {PRODUCT}
            </Heading>
            <Text onBackground="neutral-weak" as="span" textVariant="body-default-xs">
              {CLINIC}
            </Text>
          </Column>
        </Row>
      </Link>

      <Column
        flex={1}
        maxWidth="28rem"
        position="relative"
        marginX="auto"
        role="search"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Escape") setQuery("");
        }}>
        <Input
          id="patient-search"
          label="Search patient or owner"
          size="s"
          prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
          value={query}
          onValueChange={setQuery}
          autoComplete="off"
        />
        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {q ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
          </span>
        </VisuallyHidden>
        {q && (
          <Column
            position="absolute"
            top="56"
            left="0"
            fillWidth
            background="overlay"
            border
            radius="l"
            shadow="l"
            padding="8"
            gap="4"
            maxHeight="24rem"
            overflowY="auto">
            {results.length === 0 ? (
              <Row padding="8">
                <Text onBackground="neutral-weak" textVariant="body-default-s">
                  No patient or owner matches “{query.trim()}”.
                </Text>
              </Row>
            ) : (
              results.map(({ p, owner }) => (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  onClick={() => setQuery("")}
                  style={{ textDecoration: "none", color: "inherit" }}>
                  <Column padding="8" radius="m" gap="4" background="neutral-alpha-weak">
                    <Row gap="8" vertical="center" wrap>
                      <Text textVariant="label-strong-m">{p.name}</Text>
                      <Text textVariant="body-default-s" onBackground="neutral-weak">
                        {p.species}, {p.breed} · Owner {owner?.name}
                      </Text>
                    </Row>
                    <AlertTags alerts={p.alerts} size="s" />
                  </Column>
                </Link>
              ))
            )}
          </Column>
        )}
      </Column>

      <Row gap="12" vertical="center" fit>
        <Column gap="0" horizontal="end" m={{ hide: true }}>
          <Text textVariant="label-strong-s">{dateLabel}</Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Front desk
          </Text>
        </Column>
        <Row gap="8" vertical="center" fit>
          <Avatar value={initials(USER.name)} size="m" />
          <Column gap="0" s={{ hide: true }}>
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
        </Row>
      </Row>
    </Row>
  );
}
