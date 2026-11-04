"use client";

import { useEffect, useState } from "react";
import { Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { checklist, product, STORAGE_KEY, user } from "@/lib/data";

type Saved = { name: string; workspace: string; invites: number; digest: boolean };

export function Welcome() {
  const [saved, setSaved] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const fullName = saved?.name || user.name;
  const firstName = fullName.split(" ")[0];
  const workspace = saved?.workspace || "Acme Labs";

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16" horizontal="center" align="center">
          <Row center width="64" height="64" radius="full" background="success-alpha-medium">
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Tag tone="success" size="s" label="Setup complete" />
          <Heading as="h1" textVariant="display-strong-xs">
            You&apos;re all set, {firstName}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {workspace} is ready on {product.name}.
            {saved && saved.invites > 0
              ? ` We sent ${saved.invites} invite${saved.invites === 1 ? "" : "s"} to your teammates.`
              : " Invite teammates any time from Settings."}
            {saved ? (saved.digest ? " Your first digest arrives Monday." : "") : ""}
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="20" s={{ padding: "16" }}>
          <Column gap="4">
            <Heading as="h2" textVariant="heading-strong-l">
              Next steps
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Four quick things that get the most out of your first week.
            </Text>
          </Column>
          <Column as="ol" gap="16" margin="0" padding="0" style={{ listStyle: "none" }}>
            {checklist.map((item, i) => (
              <Row as="li" key={item.title} gap="16" vertical="start">
                <Row
                  center
                  width="40"
                  height="40"
                  radius="m"
                  background="brand-alpha-weak"
                  style={{ flexShrink: 0 }}
                >
                  <Icon name={item.icon} onBackground="brand-strong" />
                </Row>
                <Column gap="4" flex={1}>
                  <Text textVariant="label-strong-m">
                    {i + 1}. {item.title}
                  </Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.description}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" horizontal="center" wrap>
          <Button href="/" variant="secondary" prefixIcon="refresh">
            Run setup again
          </Button>
          <Button href="/welcome" suffixIcon="arrowRight">
            Open dashboard
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
