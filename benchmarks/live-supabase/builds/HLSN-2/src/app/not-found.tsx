import { Column, Heading, Text, Button, Particle, Background } from "@once-ui-system/core";

export default function NotFound() {
  return (
    <Column as="section" fill center padding="24">
      <Column maxWidth="m" radius="xl" padding="xl" overflow="hidden">
        <Background
          position="absolute"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 0,
            y: 125,
            colorStart: "accent-solid-strong",
          }}
        />
        <Background
          position="absolute"
          top="0"
          left="0"
          gradient={{
            display: true,
            x: 125,
            y: 100,
            width: 150,
            height: 150,
            colorStart: "brand-background-strong",
          }}
        />
        <Text marginBottom="s" variant="display-strong-xl">
          404
        </Text>
        <Heading marginBottom="8" variant="display-default-xs">
          Page Not Found
        </Heading>
        <Text onBackground="neutral-weak" marginBottom="48">
          The page you are looking for does not exist
        </Text>
        <Button variant="primary" href="/">
          Back to home
        </Button>
      </Column>
    </Column>
  );
}
