"use client";

import {
  Background,
  Button,
  Column,
  Icon,
  Row,
  SmartLink,
  Switch,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export const Cookie4: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <Column
      maxWidth={32}
      padding="24"
      gap="20"
      radius="l"
      border="brand-alpha-weak"
      overflow="hidden"
      background="surface"
      {...flex}
    >
      <Background
        position="absolute"
        fill
        left="0"
        top="0"
        gradient={{
          display: true,
          x: 100,
          y: 0,
          colorStart: "brand-background-medium",
          colorEnd: "static-transparent",
        }}
      />
      <Row gap="12" vertical="center">
        <Icon
          name="security"
          size="s"
          padding="12"
          radius="full"
          background="brand-alpha-weak"
          onBackground="brand-weak"
        />
        <Column gap="4" fillWidth>
          <Text variant="heading-strong-s">We value your privacy</Text>
          <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
            Choose how we use cookies to improve your experience. Read our{" "}
            <SmartLink href="#">Privacy Policy</SmartLink>.
          </Text>
        </Column>
      </Row>

      <Column fillWidth gap="12" padding="16" radius="m" border="neutral-alpha-weak">
        <Row fillWidth horizontal="between" vertical="center">
          <Column gap="2">
            <Text variant="label-default-s">Analytics</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Help us understand usage patterns
            </Text>
          </Column>
          <Switch checked={analytics} onToggle={() => setAnalytics(!analytics)} />
        </Row>
        <Row fillWidth horizontal="between" vertical="center">
          <Column gap="2">
            <Text variant="label-default-s">Marketing</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Personalized offers and updates
            </Text>
          </Column>
          <Switch checked={marketing} onToggle={() => setMarketing(!marketing)} />
        </Row>
      </Column>

      <Row fillWidth gap="8" wrap>
        <Button size="s" variant="secondary" fillWidth>
          Essential only
        </Button>
        <Button size="s" variant="secondary" fillWidth>
          Accept all
        </Button>
        <Button size="s" fillWidth>
          Save preferences
        </Button>
      </Row>
    </Column>
  );
};
