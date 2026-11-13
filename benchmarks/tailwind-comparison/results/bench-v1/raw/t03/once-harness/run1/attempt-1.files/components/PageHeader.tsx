"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
      <Column gap="8" flex={1} minWidth="16rem">
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        <Text onBackground="neutral-weak">{description}</Text>
      </Column>
    </Row>
  );
}
