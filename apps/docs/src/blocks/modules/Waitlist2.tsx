"use client";

import {
  Avatar,
  Badge,
  BlobFx,
  Button,
  Column,
  CountFx,
  Fade,
  Icon,
  IconButton,
  Input,
  Line,
  Pulse,
  Row,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

const recentJoins = [
  { name: "Priya Shah", avatar: "/images/creators/zsofia.jpg", time: "just now" },
  { name: "Marco Bellini", avatar: "/images/creators/evan.jpg", time: "1m ago" },
  { name: "Ken Osei", avatar: "/images/creators/dev.jpg", time: "4m ago" },
  { name: "Aiko Tanaka", avatar: "/images/creators/div.jpg", time: "9m ago" },
];

export const Waitlist2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const position = 214;

  const validateEmail = (value: unknown) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const join = () => {
    if (!email || validateEmail(email)) return;
    setJoined(true);
  };

  const copyInvite = () => {
    navigator.clipboard?.writeText("https://novastudio.app/invite/nova-214");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Row
      fillWidth
      gap="24"
      radius="xl"
      border
      overflow="hidden"
      m={{ direction: "column" }}
      {...flex}
    >
      <BlobFx position="absolute" bottom="0" left="0" />
      <Column fill minWidth={24} padding="40" gap="24" horizontal="start">
        <Badge
          background="brand-alpha-weak"
          onBackground="brand-medium"
          textVariant="label-default-s"
          paddingX="16"
        >
          Private beta
        </Badge>
        <Column gap="12">
          <Text variant="display-strong-xs">Get early access to Nova</Text>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            We're onboarding teams in small batches. Join the waitlist and skip the line by inviting
            others.
          </Text>
        </Column>

        {joined ? (
          <Column
            fillWidth
            gap="16"
            padding="20"
            radius="l"
            background="brand-alpha-weak"
            border="brand-alpha-weak"
          >
            <Row horizontal="between" vertical="center">
              <Text variant="label-default-m" onBackground="brand-medium">
                You're on the list
              </Text>
              <Row vertical="center" gap="4" textVariant="heading-strong-m">
                #
                <CountFx value={position} speed={1200} effect="smooth" easing="ease-out" />
              </Row>
            </Row>
            <Row fillWidth vertical="center" gap="8">
              <Input id="invite-link" readOnly value="novastudio.app/invite/nova-214" size="s" />
              <IconButton
                variant="secondary"
                icon={copied ? "check" : "copy"}
                tooltip={copied ? "Copied" : "Copy invite link"}
                onClick={copyInvite}
              />
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Every friend who joins with your link moves you up 5 spots.
            </Text>
          </Column>
        ) : (
          <Column fillWidth gap="12" maxWidth={22}>
            <Input
              id="waitlist-email"
              placeholder="Enter your email"
              value={email}
              validate={(value) => validateEmail(value)}
              onChange={(event) => setEmail(event.target.value)}
              suffix={
                <Button size="s" onClick={join}>
                  Join waitlist
                </Button>
              }
            />
            <Row
              gap="4"
              vertical="center"
              textVariant="body-default-xs"
              onBackground="neutral-weak"
            >
              <Icon name="security" size="xs" />
              No spam, unsubscribe anytime
            </Row>
          </Column>
        )}
      </Column>

      <Column
        fill
        minWidth={20}
        background="surface"
        borderLeft
        padding="24"
        gap="16"
        s={{ hide: true }}
      >
        <Row horizontal="between" vertical="center">
          <Row gap="8" vertical="center">
            <Pulse scheme="success" size="s" />
            <Text variant="label-default-s">Live queue</Text>
          </Row>
          <Row gap="4" vertical="center" textVariant="label-strong-s">
            <CountFx value={38} speed={2000} effect="smooth" easing="ease-out" />
            <Text onBackground="neutral-weak" variant="label-default-s">
              joined today
            </Text>
          </Row>
        </Row>
        <Line background="neutral-alpha-weak" />
        <Column fill overflow="hidden" gap="4">
          {recentJoins.map((person) => (
            <Row key={person.name} fillWidth vertical="center" gap="12" paddingY="8">
              <Avatar size="s" src={person.avatar} />
              <Column fillWidth gap="0">
                <Text variant="label-default-s" truncate>
                  {person.name}
                </Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  joined the waitlist
                </Text>
              </Column>
              <Text
                variant="body-default-xs"
                onBackground="neutral-weak"
                style={{ whiteSpace: "nowrap" }}
              >
                {person.time}
              </Text>
            </Row>
          ))}
          <Fade to="bottom" position="absolute" bottom="0" fillWidth height={5} />
        </Column>
      </Column>
    </Row>
  );
};
