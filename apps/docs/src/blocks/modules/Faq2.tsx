import { Accordion, Column, Heading, Icon, Line, Row, SmartLink, Text } from "@once-ui-system/core";
import React, { type ReactNode } from "react";
import { schema } from "@/resources";

interface Faq2Props
  extends Omit<React.ComponentProps<typeof Column>, "title" | "description" | "content"> {
  title?: ReactNode;
  description?: ReactNode;
  content: Array<{ title: ReactNode; content: ReactNode }>;
}

export const Faq2: React.FC<Faq2Props> = ({ title, description, content, ...flex }) => {
  return (
    <Column fillWidth borderTop="neutral-medium" borderBottom="neutral-medium" {...flex}>
      <Row
        position="absolute"
        top="0"
        style={{ left: "50%", transform: "translateX(-50%) translateY(-50%)" }}
        radius="full"
        background="surface"
        border="neutral-medium"
        center
        minWidth="32"
        minHeight="32"
      >
        <Icon name="chat" size="xs" onBackground="neutral-medium" />
      </Row>
      <Row fillWidth borderBottom="neutral-medium">
        <Row borderRight="neutral-medium" flex={1} />
        <Column maxWidth="s" minWidth={24} flex={3} horizontal="center">
          {(title || description) && (
            <Column fillWidth padding="32">
              {title && (
                <Heading as="h2" variant="heading-strong-l" align="center" marginBottom="8">
                  {title}
                </Heading>
              )}
              {description && (
                <Text align="center" onBackground="neutral-medium" variant="body-default-s">
                  {description}
                </Text>
              )}
            </Column>
          )}
        </Column>
        <Row borderLeft="neutral-medium" flex={1} />
      </Row>
      <Row horizontal="center" borderBottom="neutral-medium">
        <Row borderRight="neutral-medium" flex={1} />
        <Column maxWidth="s" minWidth={24} flex={3} fillWidth fitHeight background="surface">
          {content.map((item, index) => (
            <React.Fragment key={index}>
              <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {item.content}
                </Text>
              </Accordion>
              {index !== content.length - 1 && <Line background="neutral-alpha-weak" />}
            </React.Fragment>
          ))}
        </Column>
        <Row borderLeft="neutral-medium" flex={1} />
      </Row>
      <Row fillWidth>
        <Row borderRight="neutral-medium" flex={1} />
        <Column maxWidth="s" minWidth={24} flex={3} horizontal="center">
          <Row padding="32" fillWidth horizontal="center">
            <Text
              align="center"
              wrap="balance"
              variant="body-default-s"
              onBackground="neutral-medium"
            >
              Got more questions? Email us at{" "}
              <SmartLink href={`mailto:${schema.email}`}>{schema.email}</SmartLink>
            </Text>
          </Row>
        </Column>
        <Row borderLeft="neutral-medium" flex={1} />
      </Row>
    </Column>
  );
};
