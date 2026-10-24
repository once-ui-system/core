import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { schema } from "@/resources";
import { hero } from "@/content/landing";

export function Hero() {
  return (
    <Column as="section" fillWidth maxWidth="m" horizontal="center" align="center" gap="24" paddingY="64">
      <Heading as="h1" variant="display-strong-l" wrap="balance">
        {schema.name}
      </Heading>
      <Text variant="heading-default-xl" onBackground="neutral-strong" wrap="balance">
        {schema.tagline}
      </Text>
      <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
        {hero.description}
      </Text>
      <Button size="l" variant="primary" label="Get started" href="/auth" />
    </Column>
  );
}
