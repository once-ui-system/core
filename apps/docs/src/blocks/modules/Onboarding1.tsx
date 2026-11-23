"use client";

import type { IconName } from "@once-ui-system/core";
import {
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  ProgressBar,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  action: string;
  time: string;
};

const steps: Step[] = [
  {
    id: "brand",
    title: "Set your brand",
    description: "Pick a colour and fonts. Every screen follows.",
    icon: "swatch",
    action: "Open theme",
    time: "1 min",
  },
  {
    id: "invite",
    title: "Invite your team",
    description: "Teammates get their own seat and see the same workspace.",
    icon: "personAdd",
    action: "Invite",
    time: "2 min",
  },
  {
    id: "connect",
    title: "Connect your repository",
    description: "Pull requests get a preview link and a visual check.",
    icon: "code",
    action: "Connect",
    time: "3 min",
  },
  {
    id: "agent",
    title: "Hand a screen to your agent",
    description: "Copy the prompt and watch it build with your components.",
    icon: "sparkle",
    action: "Copy prompt",
    time: "5 min",
  },
];

/**
 * A first-run checklist for an app's overview: progress at the top, one row
 * per step with what it does and how long it takes, the next step expanded.
 */
export const Onboarding1: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [done, setDone] = useState<string[]>(["brand"]);
  const [hidden, setHidden] = useState(false);
  const next = steps.find((step) => !done.includes(step.id));
  const toggle = (id: string) =>
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  if (hidden) {
    return (
      <Column fillWidth center padding="l" gap="12" {...flex}>
        <Text onBackground="neutral-weak">Checklist hidden.</Text>
        <Button size="s" variant="secondary" onClick={() => setHidden(false)}>
          Show it again
        </Button>
      </Column>
    );
  }

  return (
    <Column fillWidth horizontal="center" padding="l" {...flex}>
      <Column maxWidth="s" background="surface" border radius="xl" overflow="hidden">
        <Column padding="24" gap="16" borderBottom>
          <Row horizontal="between" vertical="start" gap="16">
            <Column gap="4">
              <Heading as="h2" textVariant="heading-strong-l">
                Get set up
              </Heading>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {next
                  ? `${done.length} of ${steps.length} done. Next: ${next.title.toLowerCase()}.`
                  : "All done. Your workspace is ready."}
              </Text>
            </Column>
            <IconButton
              icon="close"
              variant="tertiary"
              size="s"
              aria-label="Hide the checklist"
              onClick={() => setHidden(true)}
            />
          </Row>
          <ProgressBar value={done.length} max={steps.length} showLabel={false} size="s" />
        </Column>
        <Column as="ol">
          {steps.map((step, index) => {
            const complete = done.includes(step.id);
            const current = step.id === next?.id;
            return (
              <Row
                as="li"
                key={step.id}
                gap="16"
                paddingX="24"
                paddingY="16"
                vertical="start"
                borderTop={index > 0}
                background={current ? "neutral-alpha-weak" : undefined}
              >
                <IconButton
                  icon={complete ? "check" : step.icon}
                  variant={complete ? "primary" : "secondary"}
                  size="m"
                  aria-label={
                    complete ? `Mark ${step.title} as not done` : `Mark ${step.title} as done`
                  }
                  aria-pressed={complete}
                  onClick={() => toggle(step.id)}
                />
                <Column flex={1} gap="4" paddingTop="4">
                  <Row gap="8" vertical="center" wrap>
                    <Text
                      textVariant="body-strong-m"
                      onBackground={complete ? "neutral-weak" : "neutral-strong"}
                      style={complete ? { textDecoration: "line-through" } : undefined}
                    >
                      {step.title}
                    </Text>
                    {current && (
                      <Tag size="s" tone="brand">
                        Next
                      </Tag>
                    )}
                  </Row>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {step.description}
                  </Text>
                  {current && (
                    <Row gap="12" vertical="center" marginTop="12">
                      <Button size="s" onClick={() => toggle(step.id)} arrowIcon>
                        {step.action}
                      </Button>
                      <Row
                        gap="4"
                        vertical="center"
                        onBackground="neutral-weak"
                        textVariant="label-default-s"
                      >
                        <Icon name="time" size="xs" />
                        {step.time}
                      </Row>
                    </Row>
                  )}
                </Column>
              </Row>
            );
          })}
        </Column>
      </Column>
    </Column>
  );
};
