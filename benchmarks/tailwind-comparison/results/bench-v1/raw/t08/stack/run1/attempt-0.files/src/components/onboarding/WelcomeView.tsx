"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Column,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { type OnboardingData, STORAGE_KEY, checklist, demoUser, product } from "@/lib/data";

type Saved = Partial<OnboardingData>;

export function WelcomeView() {
  const [saved, setSaved] = useState<Saved>({});

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // Ignore unreadable storage and fall back to the defaults.
    }
  }, []);

  const fullName = saved.name?.trim() || demoUser.name;
  const firstName = fullName.split(" ")[0];
  const workspace = saved.workspace?.trim() || "your workspace";
  const invited = (saved.invites ?? []).filter((v) => v.trim()).length;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="64" s={{ paddingY: "32" }}>
      <Column maxWidth={40} fillWidth gap="32">
        <Column gap="16" horizontal="center" align="center">
          <Row
            width="64"
            height="64"
            radius="full"
            background="success-alpha-medium"
            center
            aria-hidden="true"
          >
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {workspace === "your workspace" ? "Your workspace is" : `${workspace} is`} ready in {product.name}.
            {invited > 0
              ? ` We sent ${invited} ${invited === 1 ? "invitation" : "invitations"}.`
              : " Invite your team whenever you're ready."}
          </Text>
          <Row gap="8" wrap horizontal="center">
            <Tag scheme="brand" label={demoUser.role} />
            {saved.teamSize ? <Tag label={`Team of ${saved.teamSize}`} /> : null}
            {saved.digest ? <Tag scheme="success" label="Weekly digest on" /> : null}
          </Row>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-title"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="20"
          s={{ padding: "16" }}
        >
          <Heading as="h2" id="checklist-title" variant="heading-strong-l">
            Next steps
          </Heading>
          <Column as="ol" gap="16" margin="0" padding="0" style={{ listStyle: "none" }}>
            {checklist.map((item, i) => (
              <Row as="li" key={item.title} gap="16" vertical="start">
                <Row
                  width="40"
                  height="40"
                  radius="m"
                  background="brand-alpha-weak"
                  center
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <Icon name={item.icon} onBackground="brand-strong" />
                </Row>
                <Column gap="4" flex={1}>
                  <Text variant="label-strong-m">
                    <VisuallyStep n={i + 1} />
                    {item.title}
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {item.description}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" horizontal="center" wrap>
          <Button href="/" label="Back to onboarding" variant="secondary" prefixIcon="arrowLeft" />
          <Button href="/welcome#checklist-title" label="Start with step 1" suffixIcon="arrowRight" />
        </Row>
      </Column>
    </Column>
  );
}

function VisuallyStep({ n }: { n: number }) {
  return (
    <Text as="span" variant="label-default-s" onBackground="neutral-weak">
      {n}.{" "}
    </Text>
  );
}
