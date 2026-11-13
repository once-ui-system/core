"use client";

import {
  Avatar,
  Button,
  Column,
  Icon,
  Input,
  Row,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getOwner, owners, patients, today, user } from "@/lib/data";
import { AlertTags } from "./Alerts";

const dateLabel = new Date(`${today}T00:00:00Z`).toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(q) || owner?.name.toLowerCase().includes(q);
    });
  }, [q]);

  const open = (id: string) => {
    setQuery("");
    router.push(`/patients/${id}`);
  };

  return (
    <Column

      fillWidth
      maxWidth={32}
      position="relative"
      role="search"
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Escape") setQuery("");
      }}
    >
      <Input
        id="patient-search"
        label="Find a patient or owner"
        size="s"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
        autoComplete="off"
        aria-controls="search-results"
      />
      {q && (
        <Column
          id="search-results"
          position="absolute"
          top="56"
          left="0"
          fillWidth
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="4"
          gap="2"
          zIndex={10}
          aria-live="polite"
        >
          {results.length === 0 && (
            <Text variant="body-default-s" onBackground="neutral-weak" padding="12">
              No patient or owner matches "{query}".
            </Text>
          )}
          {results.map((p) => (
            <Button
              key={p.id}
              variant="tertiary"
              fillWidth
              horizontal="start"
              weight="default"
              onClick={() => open(p.id)}
            >
              <Row gap="12" vertical="center" fillWidth wrap>
                <Text variant="label-strong-m">{p.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {p.breed} · {getOwner(p.owner)?.name}
                </Text>
                <AlertTags alerts={p.alerts} compact />
              </Row>
            </Button>
          ))}
        </Column>
      )}
    </Column>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const onPatients = pathname.startsWith("/patients");

  return (
    <Column fillWidth minHeight="100vh" background="page">
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <Row
        as="header"
        fillWidth
        background="surface"
        borderBottom
        paddingX="20"
        paddingY="12"
        gap="16"
        vertical="center"
        wrap
        position="sticky"
        top="0"
        zIndex={5}
      >
        <Row gap="12" vertical="center" minWidth={10}>
          <Row
            width="40"
            height="40"
            center
            radius="m"
            background="brand-medium"
            onBackground="brand-strong"
          >
            <Icon name="paw" size="m" />
          </Row>
          <Column>
            <Text variant="heading-strong-m">Pawpoint</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Hillside Veterinary Clinic
            </Text>
          </Column>
        </Row>

        <Row as="nav" aria-label="Main" gap="4">
          <Button
            href="/"
            variant={onPatients ? "tertiary" : "secondary"}
            size="s"
            prefixIcon="calendar"
            label="Schedule"
            aria-current={onPatients ? undefined : "page"}
          />
          <Button
            href="/patients/p-104"
            variant={onPatients ? "secondary" : "tertiary"}
            size="s"
            prefixIcon="paw"
            label="Patients"
            aria-current={onPatients ? "page" : undefined}
          />
        </Row>

        <Row flex={1} minWidth={16} fillWidth>
          <PatientSearch />
        </Row>

        <Row gap="12" vertical="center" marginLeft="auto">
          <Column horizontal="end" s={{ hide: true }}>
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar size="s" value="RL" statusIndicator={{ color: "success" }} />
        </Row>
      </Row>

      <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
        <Column fillWidth maxWidth="xl" gap="24">
          <Row horizontal="between" vertical="end" wrap gap="8">
            <Text variant="body-default-s" onBackground="neutral-weak">
              {dateLabel} · {owners.length} owners on file
            </Text>
          </Row>
          {children}
        </Column>
      </Column>
    </Column>
  );
}
