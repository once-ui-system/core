import { brand } from "@/resources";
import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";

export function Hero(props: React.ComponentProps<typeof Column>) {
  return (
    <Column fillWidth horizontal="center" {...props}>
      <Column maxWidth="s" horizontal="center" align="center" gap="24" paddingTop="64">
        <Heading as="h1" variant="display-strong-l" wrap="balance">
          {brand.name}
        </Heading>
        <Text variant="heading-default-xl" onBackground="neutral-medium" wrap="balance">
          {brand.tagline}
        </Text>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          Write together in shared notebooks, find anything in an instant, and decide who can do what.
        </Text>
        <Row gap="12" horizontal="center" paddingTop="8">
          <Button id="hero-cta" href="/auth" arrowIcon>
            Get started
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
