"use client";

import { useEffect, useState } from "react";
import { Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { STORAGE_KEY, nextSteps, product, user } from "@/lib/data";

interface Saved {
  name?: string;
  workspace?: string;
  invites?: string[];
}

export function WelcomeView() {
  const [saved, setSaved] = useState<Saved>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const firstName = (saved.name?.trim() || user.name).split(" ")[0];
  const workspace = saved.workspace?.trim() || "Acme Labs";
  const inviteCount = (saved.invites ?? []).filter((i) => i.trim()).length;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="s" fillWidth gap="32">
        <Column gap="16" horizontal="center" align="center">
          <Row fit center radius="full" background="success-alpha-weak" width={64} height={64}>
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Tag label={`${workspace} is ready`} tone="success" size="m" />
          <Heading as="h1" textVariant="display-strong-s" wrap="balance">
            Welcome to {product.name}, {firstName}
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="balance">
            Your workspace is set up
            {inviteCount > 0
              ? ` and ${inviteCount} ${inviteCount === 1 ? "invite is" : "invites are"} on the way`
              : ""}
            . Here is what to do next to get value from {product.name} today.
          </Text>
        </Column>

        <Column
          as="ol"
          background="surface"
          border
          radius="l"
          padding="8"
          margin="0"
          aria-label="Next steps"
          style={{ listStyle: "none" }}
        >
          {nextSteps.map((item, i) => (
            <Row
              as="li"
              key={item.title}
              gap="16"
              padding="16"
              vertical="start"
              borderTop={i > 0}
            >
              <Row fit center radius="m" background="brand-alpha-weak" width={40} height={40} style={{ flexShrink: 0 }}>
                <Icon name={item.icon} size="s" onBackground="brand-strong" />
              </Row>
              <Column gap="4" flex={1}>
                <Text textVariant="heading-strong-s">{item.title}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {item.text}
                </Text>
              </Column>
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {i + 1}/{nextSteps.length}
              </Text>
            </Row>
          ))}
        </Column>

        <Row gap="12" horizontal="center" wrap>
          <Button href="/" variant="secondary" prefixIcon="chevronLeft">
            Back to setup
          </Button>
          <Button href="/welcome" suffixIcon="arrowRight">
            Create first project
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
