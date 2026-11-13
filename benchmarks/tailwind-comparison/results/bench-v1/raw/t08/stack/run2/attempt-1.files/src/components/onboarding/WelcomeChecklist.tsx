"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Column,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { STORAGE_KEY, nextSteps, product, user } from "@/lib/data";

type Saved = { name: string; workspace: string; invites: number; digest: boolean };

export function WelcomeChecklist() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const firstName = (saved?.name || user.name).split(" ")[0];
  const workspace = saved?.workspace || "";
  const completed = nextSteps.filter((s) => done[s.id]).length;
  const allDone = completed === nextSteps.length;

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="48"
      s={{ paddingY: "24" }}
    >
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16">
          <Row
            center
            width="56"
            height="56"
            radius="full"
            background="success-medium"
            onBackground="success-strong"
          >
            <Icon name="check" size="l" decorative />
          </Row>
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {workspace ? `${workspace} is` : "Your workspace is"} ready on {product.name}.
            {saved && saved.invites > 0
              ? ` We've sent ${saved.invites} ${saved.invites === 1 ? "invitation" : "invitations"}.`
              : ""}
            {saved?.digest ? " Your first weekly digest arrives Monday." : ""}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          s={{ padding: "16" }}
          gap="16"
        >
          <Row horizontal="between" vertical="center" gap="12" wrap>
            <Heading as="h2" id="checklist-heading" variant="heading-strong-l">
              Next steps
            </Heading>
            <Tag size="m" scheme={allDone ? "success" : "neutral"} aria-live="polite">
              {completed} of {nextSteps.length} done
            </Tag>
          </Row>

          <Column as="ul" margin="0" padding="0" gap="8" style={{ listStyle: "none" }}>
            {nextSteps.map((item) => (
              <Row
                as="li"
                key={item.id}
                gap="12"
                padding="16"
                radius="m"
                border="neutral-alpha-weak"
                background={done[item.id] ? "success-alpha-weak" : "transparent"}
                vertical="start"
              >
                <Checkbox
                  checked={Boolean(done[item.id])}
                  onToggle={(checked) => setDone((d) => ({ ...d, [item.id]: checked }))}
                  label={
                    <Row gap="8" vertical="center" wrap>
                      <Icon name={item.icon} size="s" onBackground="brand-medium" decorative />
                      <Text variant="label-strong-m">{item.title}</Text>
                      <Tag size="s">{item.minutes} min</Tag>
                    </Row>
                  }
                  description={item.description}
                />
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" wrap>
          <Button href="/" label="Back to setup" variant="secondary" prefixIcon="arrowLeft" />
        </Row>
      </Column>
    </Column>
  );
}
