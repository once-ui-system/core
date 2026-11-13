"use client";

import { useMemo, useState } from "react";
import { Avatar, Card, Column, Icon, Input, Row, SmartLink, Text } from "@once-ui-system/core";
import { clinicName, getOwner, patients, user } from "@/lib/data";
import { AlertTags } from "./AlertTags";

export function DeskHeader() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) return [];
    return patients.filter((p) => {
      const owner = getOwner(p.owner);
      return p.name.toLowerCase().includes(query) || owner.name.toLowerCase().includes(query);
    });
  }, [query]);

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
      horizontal="between"
      position="sticky"
      top="0"
      zIndex={5}
    >
      <SmartLink href="/">
        <Row gap="8" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-alpha-medium">
            <Icon name="paw" size="m" onBackground="brand-strong" />
          </Row>
          <Column gap="0" s={{ hide: true }}>
            <Text variant="heading-strong-m">Pawpoint</Text>
            <Text variant="label-default-xs" onBackground="neutral-medium">
              {clinicName}
            </Text>
          </Column>
        </Row>
      </SmartLink>

      <Column flex={1} maxWidth={32} position="relative">
        <Input
          id="patient-search"
          label="Search patient or owner"
          type="search"
          size="s"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          prefix={<Icon name="search" size="xs" />}
          autoComplete="off"
        />
        {query && (
          <Column
            position="absolute"
            top="56"
            left="0"
            fillWidth
            background="surface"
            border
            radius="l"
            shadow="l"
            padding="8"
            gap="4"
            zIndex={5}
            role="region"
            aria-label="Search results"
            aria-live="polite"
          >
            {results.length === 0 ? (
              <Text variant="body-default-s" onBackground="neutral-medium" padding="8">
                No patient or owner matches “{q.trim()}”.
              </Text>
            ) : (
              results.map((p) => (
                <Card key={p.id} href={`/patients/${p.id}`} padding="12" radius="m" fillWidth gap="4" direction="column">
                  <Row gap="8" vertical="center" wrap>
                    <Text variant="label-strong-m">{p.name}</Text>
                    <Text variant="body-default-s" onBackground="neutral-medium">
                      {p.species} · {getOwner(p.owner).name}
                    </Text>
                  </Row>
                  <AlertTags alerts={p.alerts} size="s" />
                </Card>
              ))
            )}
          </Column>
        )}
      </Column>

      <Row gap="12" vertical="center">
        <Column gap="0" horizontal="end" s={{ hide: true }}>
          <Text variant="label-strong-s">{user.name}</Text>
          <Text variant="label-default-xs" onBackground="neutral-medium">
            {user.role}
          </Text>
        </Column>
        <Avatar value="RL" size="m" />
      </Row>
    </Row>
  );
}
