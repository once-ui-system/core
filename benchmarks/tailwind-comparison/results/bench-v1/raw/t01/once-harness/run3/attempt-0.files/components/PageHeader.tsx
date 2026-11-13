import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Column gap="8">
      <Heading as="h1" textVariant="display-strong-xs">
        {title}
      </Heading>
      <Text textVariant="body-default-m" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
