"use client";

import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { Plans5, plans } from "./Plans5";

export const Pricing3 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="64" {...flex}>
      <Column maxWidth="40rem" gap="12" horizontal="center">
        <Tag tone="brand" size="s">
          Services
        </Tag>
        <Heading as="h1" align="center" textVariant="display-strong-m">
          Ship a complete frontend system
        </Heading>
        <Text align="center" onBackground="neutral-medium" textVariant="body-default-l" wrap="balance">
          Fixed-scope bundles with optional add-ons. Pick a foundation and customize with extras
          before you reach out.
        </Text>
      </Column>

      <Plans5 maxWidth="l" bundles={plans} />

      <Row
        maxWidth="l"
        padding="24"
        radius="l"
        border
        background="surface"
        horizontal="between"
        vertical="center"
        wrap
        gap="16"
      >
        <Column gap="4" maxWidth="32rem">
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Need something custom?
          </Text>
          <Text textVariant="body-default-s" wrap="balance">
            Enterprise teams and agencies can request a tailored scope with dedicated support.
          </Text>
        </Column>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          hello@once-ui.com
        </Text>
      </Row>
    </Column>
  );
};
