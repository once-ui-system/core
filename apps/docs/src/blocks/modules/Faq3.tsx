"use client";

import {
  AccordionGroup,
  Column,
  Heading,
  Row,
  SegmentedControl,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import type React from "react";
import { type ReactNode, useState } from "react";
import { schema } from "@/resources";

interface Faq3Props extends Omit<React.ComponentProps<typeof Column>, "content" | "title"> {
  title?: ReactNode;
  description?: ReactNode;
  content?: Array<{ title: ReactNode; content: ReactNode }>;
  categories?: {
    label: string;
    value: string;
    content: Array<{ title: ReactNode; content: ReactNode }>;
  }[];
}

export const Faq3: React.FC<Faq3Props> = ({ title, description, content, categories, ...flex }) => {
  const [activeCategory, setActiveCategory] = useState(categories?.[0]?.value || "");

  const displayContent = categories
    ? categories.find((cat) => cat.value === activeCategory)?.content || []
    : content || [];

  return (
    <Row fillWidth s={{ direction: "column" }} gap="24" {...flex}>
      <Column fillWidth paddingTop="24" paddingLeft="24">
        {title && (
          <Heading as="h2" variant="display-strong-m" marginBottom="20">
            {title}
          </Heading>
        )}
        {description && (
          <Text onBackground="neutral-medium" variant="body-default-xl">
            {description}
          </Text>
        )}
      </Column>
      <Column fillWidth>
        {categories && categories.length > 0 && (
          <Row fillWidth paddingX="24" marginBottom="24">
            <SegmentedControl
              buttons={categories.map((cat) => ({ label: cat.label, value: cat.value }))}
              value={activeCategory}
              onChange={(value) => setActiveCategory(value)}
            />
          </Row>
        )}
        <AccordionGroup
          style={{ lineHeight: "1.5" }}
          textVariant="body-default-s"
          items={displayContent}
        />
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
    </Row>
  );
};
