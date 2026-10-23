import { brand } from "@/resources";
import { Background, Button, Column, Heading, Text } from "@once-ui-system/core";

export const Hero: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => (
  <Column fillWidth horizontal="center" paddingY="64" {...flex}>
    <Background
      position="absolute"
      top="0"
      left="0"
      fillWidth
      height={40}
      gradient={{
        display: true,
        x: 50,
        y: 0,
        width: 120,
        height: 100,
        colorStart: "brand-background-strong",
        colorEnd: "static-transparent",
      }}
      pointerEvents="none"
    />
    <Column maxWidth="s" horizontal="center" align="center" gap="24" zIndex={1}>
      <Text variant="label-strong-m" onBackground="brand-medium">
        {brand.name}
      </Text>
      <Heading as="h1" variant="display-strong-l" wrap="balance">
        {brand.tagline}
      </Heading>
      <Text variant="body-default-xl" onBackground="neutral-medium" wrap="balance">
        Keep every note in shared notebooks, find anything in an instant, and decide who can see
        and edit what.
      </Text>
      <Button id="hero-cta" href="/auth" arrowIcon>
        Get started
      </Button>
    </Column>
  </Column>
);
