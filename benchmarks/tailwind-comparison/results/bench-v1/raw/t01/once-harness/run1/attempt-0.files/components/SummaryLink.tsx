"use client";

import { Card, Column, Icon, Row, Text } from "@once-ui-system/core";
import type { SummaryCard } from "@/lib/data";

export function SummaryLink({ card }: { card: SummaryCard }) {
  return (
    <Card href={card.href} fillWidth padding="20" radius="l" direction="column" gap="12" aria-label={`${card.label}: ${card.value}. ${card.note}`}>
      <Row horizontal="between" vertical="center" fillWidth>
        <Text textVariant="label-default-s" onBackground="neutral-weak">
          {card.label}
        </Text>
        <Icon name={card.icon} size="s" onBackground="neutral-weak" />
      </Row>
      <Column gap="4">
        <Text textVariant="display-strong-xs">{card.value}</Text>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {card.note}
        </Text>
      </Column>
    </Card>
  );
}
