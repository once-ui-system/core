import { Column, Heading, Text } from "@once-ui-system/core";

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <Column gap="4">
      <Heading as="h1" variant="heading-strong-l">
        {title}
      </Heading>
      {description ? (
        <Text variant="body-default-s" onBackground="neutral-weak">
          {description}
        </Text>
      ) : null}
    </Column>
  );
}
