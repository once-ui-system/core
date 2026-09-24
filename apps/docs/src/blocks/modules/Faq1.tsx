import { Accordion, Column, Heading, Line, SmartLink, Text } from "@once-ui-system/core";
import React, { type ReactNode } from "react";
import { schema } from "@/resources";

interface Faq1Props
  extends Omit<React.ComponentProps<typeof Column>, "title" | "description" | "content"> {
  title?: ReactNode;
  description?: ReactNode;
  content: Array<{ title: ReactNode; content: ReactNode }>;
}

export const Faq1: React.FC<Faq1Props> = ({ title, description, content, ...flex }) => {
  return (
    <Column fillWidth horizontal="center" {...flex}>
      <Column maxWidth="xs" horizontal="center">
        {title && (
          <Heading as="h2" variant="display-strong-xs" align="center" marginBottom="8">
            {title}
          </Heading>
        )}
        {description && (
          <Text
            align="center"
            onBackground="neutral-medium"
            variant="body-default-xl"
            marginBottom="32"
          >
            {description}
          </Text>
        )}
        <Column fillWidth fitHeight radius="l" border overflow="hidden" background="surface">
          {content.map((item, index) => (
            <React.Fragment key={index}>
              <Accordion title={<Text variant="body-default-s">{item.title}</Text>}>
                <Text variant="body-default-s" onBackground="neutral-medium">
                  {item.content}
                </Text>
              </Accordion>
              {index !== content.length - 1 && <Line />}
            </React.Fragment>
          ))}
        </Column>
        <Text
          align="center"
          wrap="balance"
          variant="body-default-s"
          onBackground="neutral-medium"
          marginTop="20"
        >
          Got more questions? Email us at{" "}
          <SmartLink href={`mailto:${schema.email}`}>{schema.email}</SmartLink>
        </Text>
      </Column>
    </Column>
  );
};
