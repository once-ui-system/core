"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Column, Icon, Input, Row, SmartLink, Text, VisuallyHidden } from "@once-ui-system/core";
import { AlertChips } from "@/components/Alerts";
import { CLINIC_NAME, ownerById, searchPatients, USER } from "@/lib/data";

function PatientSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchPatients(query), [query]);
  const showPanel = open && query.trim().length > 0;

  const go = (id: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/patients/${id}`);
  };

  return (
    <div
      role="search"
      style={{ position: "relative", flex: "1 1 16rem", maxWidth: "32rem", minWidth: 0 }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Input
        id="patient-search"
        label="Search patient or owner"
        size="s"
        autoComplete="off"
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            e.preventDefault();
            go(results[0].id);
          }
        }}
        prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      />
      <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {showPanel ? `${results.length} ${results.length === 1 ? "match" : "matches"}` : ""}
      </div>
      {showPanel && (
        <Column
          id="search-results"
          position="absolute"
          top="100%"
          marginTop="8"
          fillWidth
          background="overlay"
          border
          radius="l"
          shadow="l"
          padding="8"
          gap="4"
          zIndex={10}
        >
          {results.length === 0 ? (
            <Row padding="12">
              <Text textVariant="body-default-m" onBackground="neutral-weak">
                No patient or owner matches “{query.trim()}”.
              </Text>
            </Row>
          ) : (
            results.map((p) => (
              <Row
                as="button"
                type="button"
                key={p.id}
                onClick={() => go(p.id)}
                gap="12"
                padding="12"
                radius="m"
                vertical="center"
                fillWidth
                cursor="interactive"
                style={{ textAlign: "left", background: "transparent", border: 0, color: "inherit", font: "inherit" }}
              >
                <Column flex="1" gap="4" minWidth={0}>
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {p.species}, {p.breed} · Owner {ownerById(p.owner).name}
                  </Text>
                  <AlertChips alerts={p.alerts} />
                </Column>
                <Icon name="chevronRight" size="s" onBackground="neutral-weak" />
              </Row>
            ))
          )}
        </Column>
      )}
    </div>
  );
}

export function AppHeader() {
  return (
    <Row
      as="header"
      fillWidth
      position="sticky"
      top="0"
      zIndex={5}
      background="surface"
      borderBottom
      paddingX="16"
      paddingY="12"
      gap="16"
      wrap
      vertical="center"
    >
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>
      <SmartLink href="/" unstyled>
        <Row gap="12" vertical="center">
          <Row center width={40} height={40} radius="m" background="brand-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column>
            <Text textVariant="heading-strong-m">Pawpoint</Text>
            <Text textVariant="label-default-s" onBackground="neutral-weak" s={{ hide: true }}>
              {CLINIC_NAME}
            </Text>
          </Column>
        </Row>
      </SmartLink>
      <PatientSearch />
      <Row gap="12" vertical="center" marginLeft="auto">
        <Row s={{ hide: true }} horizontal="end">
          <Column horizontal="end">
            <Text textVariant="label-strong-s">{USER.name}</Text>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {USER.role}
            </Text>
          </Column>
        </Row>
        <Avatar size="m" value="RL" />
      </Row>
    </Row>
  );
}
