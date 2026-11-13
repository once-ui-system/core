import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Text } from "@once-ui-system/core/components/Text";

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <Column gap="4">
      <Heading as="h1" textVariant="heading-strong-l">
        {title}
      </Heading>
      <Text textVariant="body-default-s" onBackground="neutral-weak">
        {description}
      </Text>
    </Column>
  );
}
