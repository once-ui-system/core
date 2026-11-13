import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Column gap="12">
      <Text textVariant="label-default-s" onBackground="brand-medium">
        {eyebrow}
      </Text>
      <Heading as="h1" textVariant="display-strong-s">
        {title}
      </Heading>
      <Text textVariant="body-default-l" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
