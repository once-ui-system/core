"use client";

import {
  Avatar,
  Background,
  Button,
  Column,
  Heading,
  Line,
  Row,
  StylePanel,
  Switch,
  Tag,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export const Settings2 = (flex: React.ComponentProps<typeof Row>) => {
  const [notifications, setNotifications] = useState(true);

  return (
    <Row fill radius="l" overflow="hidden" gap="8" {...flex}>
      <Column
        minWidth={24}
        maxWidth={24}
        fill
        background="surface"
        border="surface"
        overflowY="auto"
        m={{ hide: true }}
      >
        <Column fillWidth paddingX="24" paddingY="24" gap="4" borderBottom>
          <Heading variant="heading-strong-l">Appearance</Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Changes apply instantly across your workspace
          </Text>
        </Column>
        <Column fillWidth padding="16">
          <StylePanel />
        </Column>
      </Column>
      <Column fill background="page" overflow="hidden" position="relative">
        <Background
          position="absolute"
          top="0"
          left="0"
          dots={{ display: true, size: "2", color: "neutral-alpha-weak" }}
        />
        <Column fill center padding="xl" gap="24">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Live preview
          </Text>
          <Column
            maxWidth={32}
            fillWidth
            background="surface"
            border
            radius="l"
            padding="24"
            gap="16"
            shadow="l"
          >
            <Row fillWidth gap="12" vertical="center">
              <Avatar size="m" src="/images/creators/lorant.jpg" />
              <Column gap="2">
                <Text variant="label-strong-s">Lorant One</Text>
                <Text variant="label-default-xs" onBackground="neutral-weak">
                  Product designer
                </Text>
              </Column>
              <Row flex="1" horizontal="end">
                <Tag scheme="brand" size="s">
                  Pro
                </Tag>
              </Row>
            </Row>
            <Line background="neutral-alpha-weak" />
            <Row fillWidth gap="8" wrap>
              <Button size="s">Primary</Button>
              <Button size="s" variant="secondary">
                Secondary
              </Button>
              <Button size="s" variant="tertiary">
                Tertiary
              </Button>
            </Row>
            <Row fillWidth horizontal="between" vertical="center" paddingTop="8">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Enable notifications
              </Text>
              <Switch checked={notifications} onToggle={() => setNotifications((prev) => !prev)} />
            </Row>
          </Column>
        </Column>
      </Column>
    </Row>
  );
};
