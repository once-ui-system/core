"use client";

import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { Plans5, plans } from "./Plans5";

export const Pricing3 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="64" {...flex}>
      <Column maxWidth={40} gap="12" horizontal="center">
        <Tag scheme="brand" size="s">
          Services
        </Tag>
        <Heading as="h1" align="center" variant="display-strong-m" wrap="balance">
          Ship a complete frontend system
        </Heading>
        <Text align="center" onBackground="neutral-medium" variant="body-default-l" wrap="balance">
          Fixed-scope bundles with optional add-ons. Pick a foundation and customize with extras
          before you reach out.
        </Text>
      </Column>

      <Plans5 maxWidth="l" bundles={plans} />

      <Row
        maxWidth="l"
        fillWidth
        padding="24"
        radius="l"
        border
        background="surface"
        horizontal="between"
        vertical="center"
        wrap
        gap="16"
      >
        <Column gap="4" maxWidth={32}>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Need something custom?
          </Text>
          <Text variant="body-default-s" wrap="balance">
            Enterprise teams and agencies can request a tailored scope with dedicated support.
          </Text>
        </Column>
        <Text variant="label-default-s" onBackground="brand-medium">
          hello@once-ui.com
        </Text>
      </Row>
    </Column>
  );
};
