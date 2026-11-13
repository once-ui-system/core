"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Column as="section" background="surface" border radius="l" padding="16" gap="12" fillWidth>
      <Row vertical="center" gap="8" horizontal="between" wrap>
        <Column gap="2">
          <Heading as="h2" textVariant="heading-strong-s">
            {title}
          </Heading>
          {subtitle ? (
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {subtitle}
            </Text>
          ) : null}
        </Column>
        {action}
      </Row>
      {children}
    </Column>
  );
}
