import { Column, Heading, Row, Text } from "@once-ui-system/core";
import type { ReactNode } from "react";
import { EVENT, formatEventDate } from "@/lib/data";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <Row fillWidth gap="16" vertical="end" wrap>
      <Column flex={1} gap="4" style={{ minWidth: "16rem" }}>
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {EVENT.name}
        </Text>
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          {formatEventDate(EVENT.date)} at {EVENT.venue}
        </Text>
      </Column>
      {actions}
    </Row>
  );
}
