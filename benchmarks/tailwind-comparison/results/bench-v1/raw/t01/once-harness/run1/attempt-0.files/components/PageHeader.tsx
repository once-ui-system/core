import { Column, Heading, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Column gap="8">
      <Heading as="h1" textVariant="display-strong-xs">
        {title}
      </Heading>
      {description ? (
        <Text onBackground="neutral-weak" textVariant="body-default-m">
          {description}
        </Text>
      ) : null}
    </Column>
  );
}
