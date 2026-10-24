import type React from "react";
import { AccordionGroup, Column, SmartLink, Text } from "@once-ui-system/core";
import { schema } from "@/resources";
import { landingCopy } from "@/content";
import { SectionHeader } from "./SectionHeader";

const copy = landingCopy.sections.faq;

interface FaqProps extends React.ComponentProps<typeof Column> {
  items: {
    title: string;
    content: React.ReactNode;
  }[];
}

export const Faq: React.FC<FaqProps> = ({ items, ...flex }) => {
  return (
    <Column fillWidth horizontal="center" gap="48" {...flex}>
      <SectionHeader label={copy.label} title={copy.title} />
      <AccordionGroup maxWidth="m" background="surface" fillWidth fitHeight items={items} />
      <Text variant="body-default-s" onBackground="neutral-weak" align="center">
        {copy.contact}{" "}
        <SmartLink href={`mailto:${schema.email}`}>{schema.email}</SmartLink>
      </Text>
    </Column>
  );
};
