"use client";

import type { IconName } from "@once-ui-system/core";
import {
  AvatarGroup,
  Button,
  Column,
  CountFx,
  Heading,
  Icon,
  Input,
  Line,
  Row,
  SegmentedControl,
  SmartLink,
  Text,
  Textarea,
} from "@once-ui-system/core";
import { useState } from "react";

const topics = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
  { value: "technical", label: "Technical" },
];

const quickLinks: Array<{ label: string; icon: IconName; href: string }> = [
  { label: "Browse documentation", icon: "book", href: "#" },
  { label: "Join our Discord", icon: "discord", href: "#" },
  { label: "Check system status", icon: "security", href: "#" },
];

export const Contact3: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const [topic, setTopic] = useState("general");
  const [sent, setSent] = useState(false);

  return (
    <Row fillWidth gap="xl" m={{ direction: "column" }} {...flex}>
      <Column fill minWidth={28} gap="24">
        <Column gap="8">
          <Heading variant="display-strong-s">Contact support</Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Tell us what you need help with and we'll route your message to the right team.
          </Text>
        </Column>

        <SegmentedControl buttons={topics} value={topic} onChange={(value) => setTopic(value)} />

        {sent ? (
          <Column
            fillWidth
            gap="8"
            padding="24"
            radius="l"
            background="brand-alpha-weak"
            border="brand-alpha-weak"
          >
            <Row gap="8" vertical="center" textVariant="label-strong-m" onBackground="brand-medium">
              <Icon name="check" size="s" />
              Message sent
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Thanks for reaching out. A team member will follow up over email shortly.
            </Text>
          </Column>
        ) : (
          <Column gap="12" fillWidth>
            <Row gap="12" fillWidth s={{ direction: "column" }}>
              <Input id="contact-name" label="Name" type="text" />
              <Input id="contact-email" label="Email" type="email" />
            </Row>
            <Textarea id="contact-message" label="Message" style={{ minHeight: "6rem" }} />
            <Row>
              <Button onClick={() => setSent(true)} arrowIcon>
                Send message
              </Button>
            </Row>
          </Column>
        )}
      </Column>

      <Column
        fill
        minWidth={20}
        gap="20"
        padding="24"
        radius="l"
        background="surface"
        border
        s={{ hide: true }}
      >
        <Column gap="4">
          <Text variant="body-default-s" onBackground="neutral-weak">
            Average response time
          </Text>
          <Row vertical="center" gap="4" textVariant="display-strong-xs">
            <CountFx value={2} speed={1000} effect="smooth" easing="ease-out" />
            <Text variant="display-strong-xs">h</Text>
          </Row>
        </Column>

        <Row gap="12" vertical="center">
          <AvatarGroup
            size="s"
            reverse
            avatars={[
              { src: "/images/creators/kevin.jpg" },
              { src: "/images/creators/aryan.jpg" },
              { src: "/images/creators/chander.jpg" },
            ]}
          />
          <Text variant="body-default-s" onBackground="neutral-weak">
            Our support team
          </Text>
        </Row>

        <Line background="neutral-alpha-weak" />

        <Column gap="4">
          {quickLinks.map((link) => (
            <SmartLink key={link.label} href={link.href} unstyled>
              <Row
                fillWidth
                horizontal="between"
                vertical="center"
                paddingY="12"
                paddingX="4"
                radius="m"
                cursor="interactive"
                textVariant="label-default-s"
              >
                <Row gap="12" vertical="center">
                  <Icon name={link.icon} size="xs" onBackground="neutral-weak" />
                  {link.label}
                </Row>
                <Icon name="arrowUpRight" size="xs" onBackground="neutral-weak" />
              </Row>
            </SmartLink>
          ))}
        </Column>
      </Column>
    </Row>
  );
};
